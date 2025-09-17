// components/AvatarCropper.tsx, for cropping the image to make sure it's a square
"use client";

import React, { useCallback, useState } from "react";
import Cropper, { Area } from "react-easy-crop";

type Props = {
    imageSrc: string; // object URL or base64 string
    onCancel: () => void;
    onCropComplete: (croppedBlob: Blob) => void;
};

export default function AvatarCropper({ imageSrc, onCancel, onCropComplete }: Props) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

    const onCropCompleteInternal = useCallback((_: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const generateCroppedImage = useCallback(async () => {
        if (!croppedAreaPixels) return;

        const image = new Image();
        image.src = imageSrc;
        await new Promise((resolve) => (image.onload = resolve));

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const { width, height, x, y } = croppedAreaPixels;
        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(image, x, y, width, height, 0, 0, width, height);

        canvas.toBlob((blob) => {
            if (blob) onCropComplete(blob);
        }, "image/jpeg", 0.9);
    }, [croppedAreaPixels, imageSrc, onCropComplete]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
            <div className="relative bg-white p-4 rounded shadow-lg w-full max-w-[95vw] md:max-w-[40vw] h-[80vh] flex flex-col">
                <div className="relative flex-1">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        cropShape="round"
                        showGrid={false}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={onCropCompleteInternal}
                    />
                </div>
                <div className="flex justify-between mt-4">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={generateCroppedImage}
                        className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
}
