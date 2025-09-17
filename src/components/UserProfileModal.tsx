// components/UserProfileModal.tsx
"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import AvatarCircle from "./AvartarCircle";

type User = {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    bio: string | null;
};

export default function UserProfileModal({
    userId,
    onClose,
}: {
    userId: string | undefined;
    onClose: () => void;
}) {
    const [user, setUser] = useState<User | null>(null);
    const [editing, setEditing] = useState<{ field: "name" | "bio" | null }>({
        field: null,
    });
    const [draft, setDraft] = useState<string>("");
    const [pwVisible, setPwVisible] = useState({
        old: false,
        new: false,
        confirm: false,
    });
    const [passwords, setPasswords] = useState({
        old: "",
        new: "",
        confirm: "",
    });

    useEffect(() => {
        if (userId === undefined) return;
        (async () => {
            const res = await fetch(`/api/user/${userId}`);
            if (res.ok) {
                const data = await res.json();
                setUser(data);
            }
        })();
    }, [userId]);

    async function saveField(field: "name" | "bio") {
        if (!draft.trim() && field === "name") return;
        const res = await fetch(`/api/user/${userId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ [field]: draft }),
        });
        if (res.ok) {
            const updated = await res.json();
            setUser(updated);
            setEditing({ field: null });
            setDraft("");
        }
    }

    async function updatePassword() {
        if (passwords.new !== passwords.confirm) {
            alert("New password and confirm password do not match");
            return;
        }
        const res = await fetch(`/api/user/${userId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password: passwords.new }),
        });
        if (res.ok) {
            alert("Password updated");
            setPasswords({ old: "", new: "", confirm: "" });
        } else {
            alert("Failed to update password");
        }
    }

    if (typeof document === "undefined") return null;
    if (!user) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/50"
                onClick={onClose}
            />
            {/* Modal */}
            <div className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-md z-10">
                <button
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                    onClick={onClose}
                >
                    <i className="bi bi-x-lg text-xl"></i>
                </button>

                {/* Avatar with camera overlay */}
                <div className="relative mx-auto w-fit">
                    <AvatarCircle imgLink={user.avatar} size={200} thumb={false} />
                    <button
                        className="absolute bottom-1 right-1 bg-white rounded-full p-2 shadow hover:bg-gray-100"
                        onClick={() => alert("TODO: open file picker & crop editor after implementation. I wanna rest for now~")}
                    >
                        <i className="bi bi-camera-fill text-gray-700"></i>
                    </button>
                </div>

                {/* Name */}
                <div className="mt-4 flex items-center justify-between">
                    {editing.field === "name" ? (
                        <>
                            <input
                                value={draft}
                                onChange={(e) => setDraft(e.target.value)}
                                className="border px-2 py-1 rounded w-full mr-2"
                            />
                            <button onClick={() => saveField("name")}>
                                <i className="bi bi-check2-square text-green-600"></i>
                            </button>
                        </>
                    ) : (
                        <>
                            <h2 className="text-xl font-semibold">{user.name}</h2>
                            <button
                                onClick={() => {
                                    setEditing({ field: "name" });
                                    setDraft(user.name || "");
                                }}
                            >
                                <i className="bi bi-pencil-square text-gray-600"></i>
                            </button>
                        </>
                    )}
                </div>
                
                {/* Email */}
                <p className="mb-2 text-sm text-gray-500">📧 {user.email}</p>

                {/* Bio */}
                <div className="mt-2 flex items-start justify-between">
                    {editing.field === "bio" ? (
                        <div className="flex w-full">
                            <textarea
                                value={draft}
                                onChange={(e) => setDraft(e.target.value)}
                                className="border rounded px-2 py-1 w-full mr-2"
                            />
                            <button onClick={() => saveField("bio")}>
                                <i className="bi bi-check2-square text-green-600 mt-1"></i>
                            </button>
                        </div>
                    ) : (
                        <div className="flex w-full justify-between">
                            <p className="text-gray-700">{user.bio || "No bio yet"}</p>
                            <button
                                onClick={() => {
                                    setEditing({ field: "bio" });
                                    setDraft(user.bio || "");
                                }}
                            >
                                <i className="bi bi-pencil-square text-gray-600"></i>
                            </button>
                        </div>
                    )}
                </div>

                {/* Password update */}
                <div className="mt-6 space-y-2">
                    {["old", "new", "confirm"].map((field) => (
                        <div key={field} className="relative">
                            <input
                                type={pwVisible[field as keyof typeof pwVisible] ? "text" : "password"}
                                placeholder={
                                    field === "old"
                                        ? "Old password"
                                        : field === "new"
                                            ? "New password"
                                            : "Confirm new password"
                                }
                                className="w-full border px-3 py-2 rounded"
                                value={passwords[field as keyof typeof passwords]}
                                onChange={(e) =>
                                    setPasswords({ ...passwords, [field]: e.target.value })
                                }
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-2.5 text-gray-500"
                                onClick={() =>
                                    setPwVisible({
                                        ...pwVisible,
                                        [field]: !pwVisible[field as keyof typeof pwVisible],
                                    })
                                }
                            >
                                <i
                                    className={`bi ${pwVisible[field as keyof typeof pwVisible]
                                            ? "bi-eye-slash"
                                            : "bi-eye"
                                        }`}
                                ></i>
                            </button>
                        </div>
                    ))}
                    <button
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded"
                        onClick={updatePassword}
                    >
                        Update Password
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
