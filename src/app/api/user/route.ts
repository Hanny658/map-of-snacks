// app/api/user/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";

// GET /api/user — return all users
export async function GET() {
    const users = await prisma.user.findMany();
    return NextResponse.json(users);
}

// POST /api/user — create a new user
export async function POST(req: Request) {
    try {
        const { name, email, password, avatar, bio, status } = await req.json();

        // Basic validation
        if (!name || !email || !password) {
            return NextResponse.json(
                { error: "Name, email, and password are required." },
                { status: 400 }
            );
        }

        // Check for existing email
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return NextResponse.json(
                { error: "Email already in use." },
                { status: 409 }
            );
        }

        // Hash password
        const hashedPassword = await hash(password, 12);
        const doSetDefaultBio = !bio || bio == '';

        // Create user
        const user = await prisma.user.create({
            data: { 
                name, 
                email, 
                password: hashedPassword, 
                ...(avatar && {avatar}), 
                ...(doSetDefaultBio ? {bio: "Hi, I'm ready to discover more'n'more interesting & affordable snacks!"} : {bio}), 
                ...(status && {status}), 
            },
        });

        return NextResponse.json(user, { status: 201 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        if (error.code === 'P2002' || error?.meta?.target?.includes('username')) {
        return NextResponse.json(
            { error: 'Username already taken, please choose another one. We want you to be Unique!' },
            { status: 409 }
        )
        }
        return NextResponse.json(
            { error: error.message || "Could not create user. Please contact me at zyh@ik.me" },
            { status: 500 }
        );
    }
}
