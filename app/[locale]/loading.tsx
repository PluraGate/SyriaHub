import Image from 'next/image'

/**
 * Global loading state shown during page navigation.
 * This is shown when navigating between pages while Next.js 
 * is fetching data on the server.
 */
export default function Loading() {
    return (
        <div className="fixed inset-0 z-[100] w-full h-full flex flex-col items-center justify-center overflow-hidden bg-background dark:bg-dark-bg">
            {/* Spinner with Logo */}
            <div className="relative flex items-center justify-center w-24 h-24">
                {/* Spinning ring */}
                <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />

                {/* Logo in center (doesn't spin) - invert for light theme */}
                <div className="relative w-12 h-12">
                    <Image
                        src="/icons/Pluragate_512x512_NoDot.svg"
                        alt="SyriaHub"
                        fill
                        className="object-contain opacity-50 dark:opacity-60 invert dark:invert-0"
                        priority
                    />
                </div>
            </div>

            {/* Optional subtle text */}
            <p className="mt-6 text-sm text-text-light dark:text-dark-text-muted tracking-wider">
                Loading...
            </p>
        </div>
    )
}
