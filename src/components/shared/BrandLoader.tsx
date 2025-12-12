'use client'

import React from 'react'

export default function BrandLoader() {
    return (
        <div className="flex items-center justify-center min-h-[60vh] w-full bg-transparent">
            <div className="relative flex items-center justify-center">
                {/* Spinning Outer Ring - Brand Pink */}
                <div className="absolute w-24 h-24 rounded-full border-4 border-primary-100 dark:border-primary-900"></div>
                <div className="absolute w-24 h-24 rounded-full border-4 border-transparent border-t-[#FF4979] animate-spin"></div>

                {/* Pulsing Glow Effect */}
                <div className="absolute w-20 h-20 bg-primary-50 dark:bg-primary-900/20 rounded-full animate-pulse"></div>

                {/* Logo Container */}
                <div className="relative w-16 h-16 rounded-full bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center overflow-hidden z-10">
                    <img
                        src="https://i.ibb.co/GfqnJKpV/softcreamlogo.png"
                        alt="Loading..."
                        className="w-12 h-12 object-contain animate-pulse"
                    />
                </div>

                {/* Optional Loading Text */}
                <div className="absolute -bottom-12 text-sm font-medium text-primary-500 animate-pulse tracking-widest">
                    LOADING
                </div>
            </div>
        </div>
    )
}
