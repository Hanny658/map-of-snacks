import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
    try {
        const { email, otp } = await req.json();

        // Basic validation
        if (!email || !otp) {
            return NextResponse.json(
                { message: "Email and OTP are required." },
                { status: 400 }
            );
        }

        // Configure transporter for Infomaniak SMTP
        const transporter = nodemailer.createTransport({
            host: process.env.INFOMANIAK_SMTP_HOST || "mail.infomaniak.com",
            port: Number(process.env.INFOMANIAK_SMTP_PORT) || 465,
            secure: true,
            auth: {
                user: process.env.INFOMANIAK_EMAIL,
                pass: process.env.INFOMANIAK_PASSWORD,
            },
        });

        // Verify SMTP connection
        await transporter.verify();

        // Send the OTP email
        const info = await transporter.sendMail({
            from: `"The Map of Snacks" <${process.env.INFOMANIAK_EMAIL}>`,
            to: email,
            subject: "Your Verification Code from snackmap.org",
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin:auto; padding:20px; border:1px solid #eaeaea; border-radius:8px; background:#f9f9f9;">
                <h2 style="text-align:center; color:#333;">🔐 Email Verification</h2>
                <p style="font-size:16px; color:#555;">
                Please use the following One-Time Password (OTP) to verify your email address:
                </p>

                <div style="text-align:center; margin:24px 0;">
                <span style="display:inline-block; font-size:24px; font-weight:bold; letter-spacing:4px; padding:12px 24px; border:2px dashed #0070f3; border-radius:6px; background:#fff; color:#0070f3;">
                    ${otp}
                </span>
                </div>

                <p style="font-size:14px; color:#777; margin-top:24px; text-align:center;">
                This code will expire soon. If you did not request this, please ignore this email.
                </p>
            </div>
            `,
        });

        console.log("Email sent:", info.messageId);

        return NextResponse.json(
            { message: "Email Verification OTP sent." },
            { status: 200 }
        );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.error("Email sending error:", error);

        // Handle specific error types
        if (error.code === "EAUTH") {
            return NextResponse.json(
                { message: "Authentication with SMTP server failed." },
                { status: 401 }
            );
        }
        if (error.code === "ECONNECTION") {
            return NextResponse.json(
                { message: "Could not connect to SMTP server." },
                { status: 503 }
            );
        }
        if (error.responseCode === 550) {
            return NextResponse.json(
                { message: "Invalid recipient email address." },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { message: "Failed to send verification email." },
            { status: 500 }
        );
    }
}
