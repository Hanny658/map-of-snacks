// app/user-intro/page.tsx
"use client";

import { Suspense } from "react";
import UserIntroContent from "./IntroRules";

export default function UserIntroPage() {
    return (
        <Suspense fallback={<div className="p-6">Loading...</div>}>
            <UserIntroContent />
        </Suspense>
    );
}
