'use client'

import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import type { Cheapie } from '@/types/cheapie'

interface Props {
    cheapie: Cheapie
    isAuthenticated: boolean
    onClose: () => void
    onMarkedGone: (id: number) => void
}

function getStockText(level: string): string {
    switch(level){
        case "low":
            return "Low Stock";
        case "mid":
            return "Mid Stock";
        case "plenty":
            return "Plenty Stock";
    }
    return "Unknown";
}

const stockColorMap: Record<Cheapie['stock'], string> = {
    plenty: 'bg-green-200 text-green-800',
    mid: 'bg-yellow-200 text-yellow-800',
    low: 'bg-orange-200 text-orange-800',
    gone: 'bg-red-200 text-red-800',
}

function timeAgo(dateString: string) {
    const now = Date.now()
    const then = new Date(dateString).getTime()
    const diff = now - then
    const s = Math.floor(diff / 1000)
    if (s < 60) return `${s} sec ago`
    const m = Math.floor(s / 60)
    if (m < 60) return `${m} min ago`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h} hr ago`
    const d = Math.floor(h / 24)
    if (d < 30) return `${d} day${d > 1 ? 's' : ''} ago`
    const mo = Math.floor(d / 30)
    if (mo < 12) return `${mo} mo${mo > 1 ? 's' : ''} ago`
    const y = Math.floor(mo / 12)
    return `${y} yr${y > 1 ? 's' : ''} ago`
}

export default function CheapieDetailModal({
    cheapie,
    isAuthenticated,
    onClose,
    onMarkedGone,
}: Props) {
    const [isUpdating, setIsUpdating] = useState(false)

    async function handleMarkGone() {
        if (!confirm('Mark this item as gone?')) return
        setIsUpdating(true)
        try {
            await fetch(`/api/cheapie/${cheapie.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stock: 'gone' }),
            })
            onMarkedGone(cheapie.id)
            onClose()
        } catch (err) {
            console.error(err)
        } finally {
            setIsUpdating(false)
        }
    }

    const modalContent = (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close icon */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                >
                    <i className="bi bi-x-lg"></i>
                </button>

                <div className="px-6 py-4">
                    {/* Title */}
                    <h3 className="text-2xl font-semibold mb-4">{cheapie.name}</h3>

                    {/* Large image */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={cheapie.image || '/snack_placeholder.jpg'}
                        alt={cheapie.name}
                        className="w-full max-h-60 object-cover rounded mb-4"
                    />

                    {/* 1st row: quantity/price & expiry */}
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-lg">
                            {cheapie.quantity} for ${cheapie.price.toFixed(2)}
                        </span>
                        <span className="text-gray-600">
                            Expiry Date: {cheapie.exp ? new Date(cheapie.exp).toLocaleDateString() : 'Unknown yet..'}
                        </span>
                    </div>

                    {/* 2nd row: added by + time ago & stock badge */}
                    <div className="flex justify-between items-center mb-6 text-sm text-gray-500">
                        <span>
                            Added by {cheapie.addBy} {timeAgo(cheapie.createdAt)}
                        </span>
                        <span
                            className={`px-2 py-0.5 rounded font-medium ${stockColorMap[cheapie.stock]}`}
                        >
                            {getStockText(cheapie.stock)}
                        </span>
                    </div>

                    {/* Buttons */}
                    <div className="flex space-x-4">
                        <button
                            onClick={handleMarkGone}
                            disabled={!isAuthenticated || isUpdating}
                            className={`
                flex-1 flex items-center justify-center py-2 rounded-lg transition
                ${!isAuthenticated || isUpdating
                                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                    : 'bg-red-500 text-white hover:bg-red-600'}
                `} 
                        >
                            <i className="bi bi-cart-x-fill mr-2" />
                            Mark as Gone
                        </button>

                        <button
                            onClick={onClose}
                            className="flex-1 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
                        >
                            Confirm
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
    // Render into the full screen
    return (createPortal(modalContent, document.body));
}
