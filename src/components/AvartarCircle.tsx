import Image from "next/image";
import React from "react";

type AvatarProps = {
    imgLink: string | null;
    size?: number; // optional size in px (default 64)
};

const AvatarCircle: React.FC<AvatarProps> = ({ imgLink, size = 32 }) => {
    return (
        <div
            className="inline-flex items-center justify-center rounded-full bg-gray-200 overflow-hidden"
            style={{ width: size, height: size }}
        >
            {imgLink ? (
                <Image
                    src={imgLink}
                    alt="avatar"
                    className="rounded-full object-cover"
                    width={size * 0.8}
                    height={size * 0.88}
                />
            ) : ( // Additional guard for no image
                <Image
                    src="/avatar_default-tn.jpg"
                    alt="avatar"
                    className="rounded-full object-cover"
                    width={size * 0.88}
                    height={size * 0.88}
                />
            )}
        </div>
    );
};

export default AvatarCircle;
