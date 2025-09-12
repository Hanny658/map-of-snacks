'use client'

import React, { useState } from 'react'
import { useSession } from "next-auth/react";

interface MapMenuProps {
    lng: number
    lat: number
    screenX: number
    screenY: number
    onClose: () => void
    onPlaceAdded: (place: Place) => void
}

export default function MapMenu({ lng, lat, screenX, screenY, onClose, onPlaceAdded }: MapMenuProps) {
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [name, setName] = useState('')
    const [address, setAddress] = useState('')

    const { data: session } = useSession();

    const handleCancel = () => {
        if (name || address) {
            if (!window.confirm('Discard entered data?')) return
        }
        setName('')
        setAddress('')
        setIsFormOpen(false)
        onClose()
    }

    const handleSubmit = async () => {
        if (!name) {
            alert ('Please enter the name of this place.')
            return
        }
        try {
            const res = await fetch('/api/place', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, address, lng, lat }),
            })
            if (!res.ok) throw new Error('Failed to add place')
            const newPlace = await res.json()
            setIsFormOpen(false)
            onClose()
            onPlaceAdded(newPlace as Place)
        } catch (err) {
            alert('Failed to submit place')
            console.error(err)
        }
    }

    // Convert lng/lat to screen position overlay (absolute)
    const style: React.CSSProperties = {
        position: 'absolute',
        top: screenY,
        left: screenX,
        transform: 'translate(-50%, -50%)',
        zIndex: 100,
    }

    return (
        <>
            {/* Overlay that captures outside clicks */}
            <div
                className="fixed inset-0 !z-[90]"
                onClick={onClose}
            >
                {/* Prevent clicks inside menu from closing */}
                <div
                    style={style}
                    className="relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Crosshair at center */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                        <i className="bi bi-crosshair text-red-600 text-2xl" />
                    </div>

                    {!isFormOpen && (
                        <div className="relative flex items-center justify-center">
                            {/* Radial buttons */}
                            <div
                                className="absolute w-32 h-32 rounded-full flex items-center justify-center mapmenu-scale-in"
                                style={{ animationFillMode: 'forwards' }}
                            >
                                {/* Add Btn */}
                                <button
                                    className="absolute -top-6 bg-green-500 text-white rounded-full w-10 h-10 flex items-center justify-center shadow"
                                    onClick={() => setIsFormOpen(true)}
                                >
                                    <i className="bi bi-plus-lg"></i>
                                </button>
                                {/* Close Btn */}
                                <button
                                    className="absolute -bottom-6 bg-gray-700 text-white rounded-full w-10 h-10 flex items-center justify-center shadow"
                                    onClick={onClose}
                                >
                                    <i className="bi bi-x-lg"></i>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Floating form */}
            {isFormOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-[200]">
                    <div className="bg-white p-6 rounded-xl w-96 shadow-xl space-y-4">
                        <h2 className="text-lg font-bold">Add New Place</h2>
                        <p className="text-sm text-gray-600">lng: {lng.toFixed(8)}, lat: {lat.toFixed(8)}</p>

                        <div>
                            <label className="block text-sm font-medium">Name *</label>
                            <input
                                className="w-full border rounded px-2 py-1"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium">Address</label>
                            <input
                                className="w-full border rounded px-2 py-1"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                            />
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                                onClick={handleCancel}
                            >
                                Cancel
                            </button>
                            {session ? 
                                <button
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                    onClick={handleSubmit}
                                    disabled={!name || !address}
                                >
                                    Add Store
                                </button>
                                :
                                <button
                                    className="px-4 py-2 bg-blue-900 text-white rounded hover:bg-blue-900"
                                    disabled
                                >
                                    Please Log-in to Contribute~
                                </button>
                            }
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
