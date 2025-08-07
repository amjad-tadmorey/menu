/* eslint-disable react/prop-types */
import { useState } from "react"

export default function Image({ src, alt, className = "" }) {
    const [loaded, setLoaded] = useState(false)

    return (
        <div className={`relative overflow-hidden ${className}`}>
            {!loaded && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-md z-10" />
            )}

            <img
                src={src}
                alt={alt}
                onLoad={() => setLoaded(true)}
                className={`w-full h-full object-cover transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"
                    }`}
            />
        </div>
    )
}
