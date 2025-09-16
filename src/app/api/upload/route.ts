/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/upload/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { Readable } from 'stream'
import { writeFile, mkdirSync, existsSync } from 'fs'
import { promisify } from 'util'
import path from 'path'
import sharp from 'sharp'

// Wrap writeFile to Promise 
const writeFileAsync = promisify(writeFile)

// busboy/sharp needs nodejs
export const runtime = 'nodejs'

/**
 * POST /api/upload
 *
 * - Limit：if file buffer is greater than 10M, return 413
 * - if final file sized > 1MB, use sharp to compress it to JPEG(quality: 80)
 * - write it to public/uploads/{timestamp}-{rand}.{ext}, then give back { url }
 */
export async function POST(request: NextRequest) {
    // turn NextRequest.headers to a universal object
    const headers = Object.fromEntries(request.headers.entries())
    const { searchParams } = new URL(request.url)
    const generateThumb = searchParams.get('thumb') !== 'false'

    // import Busboy dynamically for ESM runtime
    let BusboyFactory: any
    try {
        const imported = await import('busboy')
        BusboyFactory = (imported as any).default || (imported as any).Busboy || imported
    } catch (err) {
        console.error('[API][Upload] Cannot import busboy: ', err)
        return NextResponse.json(
            { error: 'Internal Server Error: failed to load file handling system.' },
            { status: 500 }
        )
    }

    return new Promise<NextResponse>(async (resolve) => {
        try {
            const busboy = BusboyFactory({ headers })
            let fileBuffer: Buffer = Buffer.alloc(0)
            let originalFilename: string = ''
            let fileTooLarge = false

            let originalExt = path.extname(originalFilename).toLowerCase() || '.jpg'

            busboy.on(
                'file',
                (
                    _fieldname: string,
                    fileStream: NodeJS.ReadableStream,
                    info: { filename: string; encoding: string; mimeType: string }
                ) => {
                    originalFilename = info.filename

                    fileStream.on('data', (chunk: Buffer) => {
                        fileBuffer = Buffer.concat([fileBuffer, chunk])
                        if (fileBuffer.length > 10 * 1024 * 1024) {
                            // > 10MB, mark as too big. Tag it 
                            fileTooLarge = true
                            fileStream.resume()
                        }
                    })
                }
            )

            busboy.on('finish', async () => {
                if (fileTooLarge) {
                    return resolve(
                        NextResponse.json(
                            { error: 'File is too big, Maximum 10 MB' },
                            { status: 413 }
                        )
                    )
                }
                if (!originalFilename) {
                    return resolve(
                        NextResponse.json(
                            { error: 'File not found in the upload request PAYLOAD' },
                            { status: 400 }
                        )
                    )
                }
                try {
                    let finalBuffer: Buffer = fileBuffer

                    // for final buffer > 1MB, use sharp to convert it to JPEG
                    if (fileBuffer.length > 1 * 1024 * 1024) {
                        finalBuffer = await sharp(fileBuffer)
                            .jpeg({ quality: 80 })
                            .toBuffer()
                        originalExt = '.jpg' // now original not matter
                    }

                    // check dir: public/uploads
                    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
                    if (!existsSync(uploadsDir)) {
                        mkdirSync(uploadsDir, { recursive: true })
                    }

                    // generate the unique filename：timestamp-rand.ext
                    const timestamp = Date.now()
                    const randomStr = Math.random().toString(36).slice(2, 8)
                    const ext = originalExt || '.jpg'
                    const baseName = `${timestamp}-${randomStr}`
                    const filename = `${baseName}${ext}`
                    const filePath = path.join(uploadsDir, filename)

                    // Finally write it to local (original + thumbnail)
                    await writeFileAsync(filePath, finalBuffer)

                    if (generateThumb) {
                        // Generate thumbnail - 128px wide in same format
                        let thumbPipeline = sharp(finalBuffer).resize({ width: 128 })
                        if (originalExt === '.jpg' || originalExt === '.jpeg') {
                        thumbPipeline = thumbPipeline.jpeg({ quality: 80 })
                        } else if (originalExt === '.png') {
                        thumbPipeline = thumbPipeline.png({ compressionLevel: 8 })
                        } else if (originalExt === '.webp') {
                        thumbPipeline = thumbPipeline.webp({ quality: 80 })
                        }else if (originalExt === '.avif') {
                        thumbPipeline = thumbPipeline.avif({ quality: 80 })
                        }else if (originalExt === '.gif') {
                        thumbPipeline = thumbPipeline.gif()
                        }
                        const thumbBuffer = await thumbPipeline.toBuffer()

                        // Strictly "-tn" suffix before extension
                        const thumbFilename = `${baseName}-tn${originalExt}`
                        const thumbPath = path.join(uploadsDir, thumbFilename)
                        await writeFileAsync(thumbPath, thumbBuffer)
                    }

                    // Only return the *main URL* (thumbnail can be derived)
                    const publicUrl = `/uploads/${filename}`
                    return resolve(NextResponse.json({ url: publicUrl }))
                } catch (err) {
                    console.error('[API][Upload] Write/Compress Error: ', err)
                    return resolve(
                        NextResponse.json(
                            { error: 'File failed to be saved.' },
                            { status: 500 }
                        )
                    )
                }
            })

            // turn NextRequest.body to ArrayBuffer, then to Node.js Buffer for passing to Busboy
            const arrayBuffer = await request.arrayBuffer()
            const buffer: Buffer = Buffer.from(arrayBuffer)
            const bufferStream = Readable.from(buffer)
            bufferStream.pipe(busboy)
        } catch (err) {
            console.error('[API][Upload] Request handling Error: ', err)
            return resolve(
                NextResponse.json(
                    { error: 'Cannot process file' },
                    { status: 500 }
                )
            )
        }
    })
}
