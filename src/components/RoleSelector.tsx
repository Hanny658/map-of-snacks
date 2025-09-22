"use client";

import { useEffect } from "react";

interface Props {
    role: "visitor" | "contributor";
    onRoleChange: (role: "visitor" | "contributor") => void;
    agreed: boolean;
    onAgreeChange: (checked: boolean) => void;
}

export default function RoleSelector({
    role,
    onRoleChange,
    agreed,
    onAgreeChange,
}: Props) {
    // reset checkbox when switching role
    useEffect(() => {
        onAgreeChange(false);
    }, [role, onAgreeChange]);

    return (
        <div className="space-y-3">
            {/* Role Tabs */}
            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={() => onRoleChange("visitor")}
                    className={`flex-1 px-3 py-2 rounded border ${role === "visitor"
                            ? "bg-blue-100 border-blue-500 font-semibold"
                            : "bg-gray-50 border-gray-300"
                        }`}
                >
                    Visitor
                </button>
                <button
                    type="button"
                    onClick={() => onRoleChange("contributor")}
                    className={`flex-1 px-3 py-2 rounded border ${role === "contributor"
                            ? "bg-blue-100 border-blue-500 font-semibold"
                            : "bg-gray-50 border-gray-300"
                        }`}
                >
                    Contributor
                </button>
            </div>

            {/* Mandatory checkbox */}
            <label className="flex items-start gap-2 text-sm">
                <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => onAgreeChange(e.target.checked)}
                    className="mt-1"
                />
                <span>
                    I have read and agree to{" "}
                    {role === "visitor" ? (
                        <>
                            <a href="/user-intro?role=visitor" target="_blank" className="text-blue-600 underline">
                                Community Intro & Rules
                            </a>
                        </>
                    ) : (
                        <>
                            <a href="/user-intro?role=contributor" target="_blank" className="text-blue-600 underline">
                                Contributor Intro & Rules
                            </a>
                        </>
                    )}
                </span>
            </label>
        </div>
    );
}
