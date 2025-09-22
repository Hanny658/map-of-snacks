"use client";

import { useSearchParams, useRouter } from "next/navigation";

export default function UserIntroPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const role = (searchParams.get("role") as "visitor" | "contributor") || "visitor";

    const handleTabChange = (newRole: "visitor" | "contributor") => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("role", newRole);
        router.replace(`/user-intro?${params.toString()}`);
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-10">
            <h1 className="text-3xl font-bold mb-6">Welcome to the Map of Snacks!</h1>

            {/* Tabs */}
            <div className="flex gap-0 mb-8">
                <button
                    type="button"
                    onClick={() => handleTabChange("visitor")}
                    className={`flex-1 px-0 py-2 rounded-l border ${role === "visitor"
                            ? "bg-blue-100 border-blue-500 font-semibold"
                            : "bg-gray-50 border-gray-300"
                        }`}
                >
                    Visitor
                </button>
                <button
                    type="button"
                    onClick={() => handleTabChange("contributor")}
                    className={`flex-1 px-0 py-2 rounded-r border ${role === "contributor"
                            ? "bg-blue-100 border-blue-500 font-semibold"
                            : "bg-gray-50 border-gray-300"
                        }`}
                >
                    Contributor
                </button>
            </div>

            {/* Role-based Introduction */}
            <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-3">Role Introduction</h2>
                {role === "visitor" ? (
                    <div className="space-y-3">
                        <p>
                            As a <b>Visitor</b>, you can explore the Snack Map and:
                        </p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Browse snack offers pinned to existing stores.</li>
                            <li>Add new snack offers to stores already on the map.</li>
                            <li>
                                Mark an offer as <b>“gone”</b> when you see empty shelves or can’t
                                find it in-store.
                            </li>
                        </ul>
                        <p>
                            Visitors are the backbone of our community by keeping store offers
                            up to date and ensuring information stays reliable for everyone.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <p>
                            As a <b>Contributor</b>, you have all Visitor permissions, plus:
                        </p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>
                                Add entirely new stores to the map by <b>right-click</b> (PC) or{" "}
                                <b>long-press</b> (mobile).
                            </li>
                            <li>Edit details of existing stores, such as their name or location.</li>
                            <li>
                                Edit existing snack offers to ensure information stays accurate.
                            </li>
                        </ul>
                        <p>
                            Contributors help expand and refine the Snack Map. With greater
                            permission comes greater responsibility — please use it wisely!
                        </p>
                    </div>
                )}
            </section>

            {/* Community Rules */}
            <section>
                <h2 className="text-2xl font-semibold mb-3">Community Introduction & Rules</h2>
                <p className="mb-3">
                    We&apos;re a group of snack lovers, bargain hunters, and everyday shoppers who believe that sharing what we see in our local stores helps everyone. Whether you&apos;re looking for the best deal, hoping to discover hidden gems, or eager to contribute your findings, this is the place for you.
                </p><p className="mb-3">
                    Our map is built entirely by the community — every store, every snack offer, and every update comes from users like you. The more we share, the more accurate and useful the map becomes for everyone.
                </p><p className="mb-3">
                    Think of Snack Map as a friendly neighborhood noticeboard, but for snacks! By working together, we can keep shelves transparent (across the ethernet cable!), help each other find affordable snacks, and celebrate the joy of finding great deals.
                </p>
                <ol className="list-decimal pl-6 space-y-2">
                    <li>
                        <b>Be Honest:</b> Only add or update snack offers and store details
                        that you have directly observed.
                    </li>
                    <li>
                        <b>Be Accurate:</b> Ensure information is as correct as possible —
                        incorrect prices, expiry dates, or store locations cause confusion.
                    </li>
                    <li>
                        <b>Be Respectful:</b> Treat other users with courtesy. Remember that
                        this is a community project to benefit everyone.
                    </li>
                    <li>
                        <b>No Malicious Activity:</b> Any attempt to tamper with or
                        deliberately mislead the system (e.g., false stores, fake offers,
                        mass “gone” markings) will result in a permanent ban.
                    </li>
                    <li>
                        <b>Report Problems:</b> If you notice misinformation or abuse, please
                        flag it to the moderators (future feature, still in plan).
                    </li>
                    <li>
                        <b>Retailers Welcome:</b> If you represent a store and want to
                        officially join the Snack Map, please contact me at{" "}
                        <a href="mailto:zyh@ik.me" className="text-blue-600 underline">
                            zyh@ik.me
                        </a>.
                    </li>
                </ol>
                <p className="mt-4 text-gray-600">
                    By using the Snack Map, you agree to follow these rules and help us
                    build a positive, friendly, and reliable community for snack lovers
                    everywhere.
                </p>
            </section>
        </div>
    );
}
