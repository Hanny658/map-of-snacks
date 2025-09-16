// app/api/admin/cleanup/unlinked-files/route.ts
import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { prisma } from '@/lib/prisma'

export async function DELETE() {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    let files: string[] = []
    try {
        files = await fs.promises.readdir(uploadsDir)
    } catch (err) {
        console.error('Reading uploads directory failed:', err)
        return NextResponse.json({ removed: 0 }, { status: 500 })
    }

    // Collect ALL referenced filenames from models (Such an expensive operation!)
    // 1. Cheapies > Image
    const cheapies = await prisma.cheapie.findMany({ select: { image: true } })
    const referenced = new Set<string>()
    cheapies.forEach(c => {
        if (c.image) {
            const filename = path.basename(c.image)
            referenced.add(filename)
        }
    })
    // 2. User > Avatar
    const users = await prisma.user.findMany({ select: { avatar: true } })
    users.forEach(u => {
        if (u.avatar) {
            const filename = path.basename(u.avatar)
            referenced.add(filename)
        }
    })
    // TODO: keep add other models with file fields as needed

    // Determine unlinked files (including thumbnails)
    const unlinked: string[] = []

    for (const f of files) {
        // Check if this file is referenced directly
        if (referenced.has(f)) continue

        // Check if this file is a thumbnail of a referenced file
        const dotIndex = f.lastIndexOf('.')
        if (dotIndex !== -1) {
            const base = f.slice(0, dotIndex)
            const ext = f.slice(dotIndex)
            if (base.endsWith('-tn')) {
                const originalName = base.slice(0, -3) + ext // remove "-tn"
                if (referenced.has(originalName)) continue
            }
        }

        // If neither the file nor its original is referenced → mark unlinked
        unlinked.push(f)
    }

    // Remove them
    let removedCount = 0
    for (const fname of unlinked) {
        try {
            await fs.promises.unlink(path.join(uploadsDir, fname))
            removedCount++
        } catch (err) {
            console.error('Failed to delete file', fname, err)
        }
    }

    return NextResponse.json({ removed: removedCount })
}
