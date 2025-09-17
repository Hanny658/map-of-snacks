// components/UserProfileModal.tsx
"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import AvatarCircle from "./AvartarCircle";
import { useSession } from "next-auth/react";
import AvatarCropper from "./AvatarCropper";

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
    const [original, setOriginal] = useState<string | null>("");
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
    const [startPwdReset, setStartPwdReset] = useState<boolean>(false);
    const [pwdErr, setPwdErr] = useState<string>("");
    const [pwdSuc, setPwdSuc] = useState<boolean>(false);
    const [cropSrc, setCropSrc] = useState<string | null>(null);

    const { update } = useSession();

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
        if (!draft.trim() && field === "name") return;      // empty name
        if (draft.length > 32 && field === "name") return;  // name too long
        if (draft == original) {                            // not editing
            setEditing({field :null})
            return;
        }
        const res = await fetch(`/api/user/${userId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ [field]: draft }),
        });
        if (res.ok) {
            const updated = await res.json();
            setUser(updated);
            await update(); // forces next-auth to call callbacks again
            setEditing({ field: null });
            setDraft("");
        }
    }

    async function handleAvatarUpload(blob: Blob) {
        const formData = new FormData();
        formData.append("file", blob, "avatar.jpg");

        const uploadRes = await fetch("/api/upload", {
            method: "POST",
            body: formData,
        });

        if (uploadRes.ok) {
            const { url } = await uploadRes.json();
            // Update user profile with avatar
            await fetch(`/api/user/${userId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ avatar: url }),
            });

            setUser((prev) => (prev ? { ...prev, avatar: url } : prev));
            setCropSrc(null);
        }
    }

    async function updatePassword() {
        setPwdErr("");
        if (passwords.new !== passwords.confirm) {
            setPwdErr("New password and confirm password do not match");
            return;
        }
        if (passwords.new === passwords.old) {
            setPwdErr("Entered old password and new password are the same");
            return;
        }
        const res = await fetch(`/api/user/${userId}/pwd-update`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ oldPassword: passwords.old, newPassword: passwords.new }),
        });
        if (res.ok) {
            setPwdSuc(true);
            setStartPwdReset(false);
            setPasswords({ old: "", new: "", confirm: "" });
        } else {
            const resData = await res.json();
            setPwdErr(resData?.error);
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
                        onClick={() => {
                            const input = document.createElement("input");
                            input.type = "file";
                            input.accept = "image/*";
                            input.onchange = (e) => {
                                const file = (e.target as HTMLInputElement).files?.[0];
                                if (file) {
                                    setCropSrc(URL.createObjectURL(file));
                                }
                            };
                            input.click();
                        }}
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
                                maxLength={32}
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
                                    setOriginal(user.name);
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
                                    setOriginal(user.bio);
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
                {startPwdReset ?
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
                        {pwdErr && <p className="text-red-700/80 text-sm text-right">{pwdErr}</p>}
                        <button
                            className="w-1/2 mt-6 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-l"
                            onClick={()=>setStartPwdReset(false)}
                        >
                            Cancel
                        </button>
                        <button
                            className="w-1/2 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-r"
                            onClick={updatePassword}
                        >
                            Update Password
                        </button>
                    </div>
                    :
                    <button
                        className="w-full mt-6 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded"
                        onClick={()=> {
                            setPwdSuc(false);
                            setStartPwdReset(true);
                        }}
                    >
                        Change Password
                    </button>
                }
                {pwdSuc && <p className="text-sm text-green-600/80 text-right">Congrats~ Your password just updated!</p>}
            </div>
            {/* Cropper overlay */}
            {cropSrc && (
                <AvatarCropper
                    imageSrc={cropSrc}
                    onCancel={() => setCropSrc(null)}
                    onCropComplete={handleAvatarUpload}
                />
            )}
        </div>,
        document.body
    );
}
