// app/api/user/[id]/pwd-update/route.ts
import { prisma } from "@/lib/prisma";
import { compare, hash } from "bcryptjs";
import { NextResponse } from "next/server";

interface Params {
    params: Promise<{ id: string }>
}

/** Takes an old password and a new password for user with id. check for old and update new. */
export async function PUT(req: Request, { params }: Params ) {
    const { id }  = await params;
    try {
        const body = await req.json();
        const { oldPassword, newPassword } = body;

        if (!oldPassword || !newPassword) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { id },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const valid = await compare(oldPassword, user.password);
        if (!valid) {
            return NextResponse.json(
                { error: "Old password is incorrect" },
                { status: 401 }
            );
        }

        const hashed = await hash(newPassword, 12);
        await prisma.user.update({
            where: { id },
            data: { password: hashed },
        });

        return NextResponse.json({ message: "Password updated successfully" });
    } catch (err) {
        console.error("Error updating password:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
