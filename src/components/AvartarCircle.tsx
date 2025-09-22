// components/AvatarCircle.tsx, for displaying circular avatar picture
import React from "react";

type AvatarProps = {
    imgLink: string | null;
    size?: number; // optional size in px (default 64)
    thumb?: boolean | null;
};

const AvatarCircle: React.FC<AvatarProps> = ({ imgLink, size = 32, thumb = true }) => {
    return (
        <div
            className="inline-flex items-center justify-center rounded-full bg-gray-200 overflow-hidden"
            style={{ width: size, height: size }}
        >
            {imgLink ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={imgLink}
                    alt="avatar"
                    className="rounded-full object-cover"
                    width={size * 0.8}
                    height={size * 0.88}
                />
            ) : ( // Additional guard for no image
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={thumb ? "/avatar_default-tn.jpg" : "/avatar_default.jpg"}
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
