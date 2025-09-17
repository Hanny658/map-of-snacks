// components/RegLog.tsx
"use client";

import { useState, useEffect } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import AvatarCircle from "./AvartarCircle";


export default function RegLogModal() {
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState<"login" | "register">("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [showPwd, setShowPwd] = useState(false);
    const [userOtp, setUserOtp] = useState("");
    const [otp, setOtp] = useState<string | null>(null);
    const [otpExpiry, setOtpExpiry] = useState<number | null>(null);
    const [otpCooldown, setOtpCooldown] = useState(0);
    const [message, setMessage] = useState<{ text: string; type: "success" | "error" | null }>({ text: "", type: null });
    const [loading, setLoading] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!session?.user?.id) return;
        const fetchUser = async () => {
            try {
                const res = await fetch(`/api/user/${session?.user?.id}`);
                if (!res.ok) throw new Error("Failed to fetch user");

                const user = await res.json();

                if (!user?.avatar || user.avatar.trim() === "") {
                    setAvatarUrl("/avatar_default-tn.jpg");
                } else {
                    setAvatarUrl(user.avatar);
                }
            } catch (err) {
                console.error("Error fetching avatar:", err);
                setAvatarUrl("/avatar_default-tn.jpg");
            }
        };

        fetchUser();
    }, [session?.user?.id]);

    // Cooldown timer
    useEffect(() => {
        if (otpCooldown > 0) {
        const timer = setInterval(() => {
            setOtpCooldown((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
        }
    }, [otpCooldown]);

    // Helper function to get user avatar / notfound -> default
    // const getAvatarPic = async (userId: string, thumb: boolean = false): Promise<string | null> => {
    //     try {
    //         const res = await fetch(`/api/user/${userId}`, { method: "GET" });
    //         if (!res.ok) throw new Error("Failed to fetch user");

    //         const user = await res.json();

    //         // If avatar is missing or empty string, return null
    //         if (!user?.avatar || user.avatar.trim() === "") {
    //             if (thumb) return "/avatar_default-tn.jpg";
    //             return "/avatar_default.jpg";
    //         }

    //         let avatarUrl = user.avatar;

    //         if (thumb) {
    //             // Insert "-tn" before the file extension for thumbnail pic
    //             const lastDotIndex = avatarUrl.lastIndexOf(".");
    //             if (lastDotIndex !== -1) {
    //                 avatarUrl =
    //                     avatarUrl.slice(0, lastDotIndex) +
    //                     "-tn" + avatarUrl.slice(lastDotIndex);
    //             } else {
    //                 // No extension found, just append -tn
    //                 avatarUrl += "-tn";
    //             }
    //         }

    //         return avatarUrl;
    //     } catch (err) {
    //         console.error("Error fetching avatar:", err);
    //         return null;
    //     }
    // };

    // Generate random 7-digit OTP
    const generateOtp = () => Math.floor(1000000 + Math.random() * 9000000).toString();

    const handleSendOtp = async () => {
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            setMessage({ text: "Please enter a valid email address.", type: "error" });
            setOtpCooldown(5); // short cooldown
            return;
        }

        const newOtp = generateOtp();
        setOtp(newOtp);
        setOtpExpiry(Date.now() + 7 * 60 * 1000);
        setLoading(true);
        setMessage({ text: "", type: null });

        try {
            const res = await fetch("/api/auth/email-otp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, otp: newOtp }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage({ text: data.message || "OTP sent successfully.", type: "success" });
                setOtpCooldown(60); // 60s cooldown
            } else {
                setMessage({ text: data.message || "Failed to send OTP.", type: "error" });
                setOtpCooldown(5);
            }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            setMessage({ text: err.message ? err.message :"Network error. Please try again.", type: "error" });
            setOtpCooldown(5);
        } finally {
            setLoading(false);
        }
    };

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage({ text: "", type: null });
        // Check OTP matching
        if (mode === "register") {
            // Check OTP presence
            if (!otp) {
                setMessage({ text: "Please verify your email with an OTP before registering.", type: "error" });
                return;
            }

            // Check expiry
            if (otpExpiry && Date.now() > otpExpiry) {
                setMessage({ text: "Your OTP has expired. Please request a new one.", type: "error" });
                return;
            }

            // Check user input
            if (userOtp !== otp) {
                setMessage({ text: "Invalid OTP. Please try again.", type: "error" });
                return;
            }
        }
        // Passed -> actual register
        const res = await signIn("credentials", {
            redirect: false,
            mode,
            email,
            password,
            ...(mode === "register" && { username }),
        });
        if (res?.error) {
            setMessage({ text: res.error, type: "error" });
        } else {
            window.location.reload();
        }
    };

    const handleLogout = async () => {
        setDropdownOpen(false);
        if (confirm("Are you sure you want to logout?")) {
            await signOut({ callbackUrl: "/" });
        }
    };

    return (
        <>
            {/* Toggle button */}
            {!session ? (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                    Login
                </button>
            ) : (
                <div className="relative inline-block">
                    <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition"
                    >
                        <AvatarCircle imgLink={avatarUrl} />
                        <span className="whitespace-nowrap">{session.user?.name || "User"}</span>
                    </button>
                    {dropdownOpen && (
                        <div className="absolute left-0 mt-1 min-w-28 bg-white rounded shadow-lg z-50">
                            <button
                                onClick={()=>{}}
                                className="w-full text-left px-4 py-2 bg-sky-50 hover:bg-sky-100"
                            >
                                My Profile
                            </button>
                            <button
                                onClick={handleLogout}
                                className="w-full text-left px-4 py-2 bg-red-50 hover:bg-red-100/80"
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Modal backdrop & container */}
            <div
                className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 transition-opacity duration-300 ease-in-out ${isOpen && !session ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                    }`}
            >
                <div
                    className={`bg-white text-black w-full max-w-md mx-2 p-6 rounded-lg shadow-lg transform transition-transform duration-300 ease-in-out ${isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
                        } relative`}
                >
                    {/* Close Icon */}
                    <button
                        onClick={() => setIsOpen(false)}
                        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition"
                    >
                        <i className="bi bi-x-lg"></i>
                    </button>

                    <h2 className="text-2xl font-semibold mb-4">
                        {mode === "login" ? "Login" : "Register"}
                    </h2>

                    <form onSubmit={handleAuth} className="space-y-4">
                        {mode === "register" && (
                            <div>
                                <label className="block text-sm mb-1">Username</label>
                                <input
                                    type="text"
                                    required
                                    value={username}
                                    maxLength={32}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <div className="w-full text-sm text-gray-500 text-right">Choose your unique nickname~ (no more than 32 charactors)</div>
                            </div>
                        )}
                        <div>
                            <label className="block text-sm mb-1">Email</label>
                            <input
                                type="email"
                                required
                                value={email}
                                maxLength={255}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="relative">
                            <label className="block text-sm mb-1">Password</label>
                            <input
                                type={showPwd ? "text" : "password"}
                                required
                                value={password}
                                minLength={6}
                                maxLength={255}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {mode === "register" && <div className="w-full text-sm text-gray-500 text-right">Please set you password longer than 6 charactors~</div> }
                            <div className="absolute z-50 top-8 right-3">
                                <i className={`bi ${showPwd ? 'bi-eye-slash' : 'bi-eye'} text-lg text-cyan-700/80`} 
                                onClick={() => { setShowPwd(!showPwd); }}></i>
                            </div>
                        </div>

                        {mode === "register" && (
                            <div className="mb-6">
                                <label className="block mb-2 text-sm">Verification Code</label>
                                <div className="flex w-full">
                                    <input
                                        type="text"
                                        className="flex-grow border border-gray-300 px-3 py-2 rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter the OTP"
                                        value={userOtp}
                                        onChange={(e) => setUserOtp(e.target.value)}
                                        disabled={loading}
                                    />
                                    <button
                                        onClick={handleSendOtp}
                                        disabled={loading || otpCooldown > 0}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-r disabled:opacity-50 whitespace-nowrap"
                                    >
                                        {loading ? (
                                            <svg
                                                className="animate-spin h-5 w-5 text-white"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                ></circle>
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8v8H4z"
                                                ></path>
                                            </svg>
                                        ) : otpCooldown > 0 ? `Wait ${otpCooldown}s` : "Send"}
                                    </button>
                                </div>
                            </div>
                        )}
                        
                        {message.text && (
                            <p
                                className={`mt-2 text-sm ${message.type === "success" ? "text-green-600" : "text-red-600"
                                    }`}
                            >
                                {message.text}
                            </p>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
                        >
                            {mode === "login" ? "Login" : "Register"}
                        </button>
                    </form>

                    <p className="mt-4 text-center text-sm">
                        {/* <b className="text-gray-500">Register will be available after Close Beta</b> */}
                        {mode === "login"
                            ? "Don't have an account?"
                            : "Already have an account?"}{" "}
                        <button
                            onClick={() => setMode(mode === "login" ? "register" : "login")}
                            className="text-blue-600 hover:underline"
                        >
                            {mode === "login" ? "Register" : "Login"}
                        </button>
                    </p>
                </div>
            </div>
        </>
    );
}
