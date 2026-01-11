import Image from 'next/image'

/**
 * Global loading state shown during page navigation.
 * This is shown when navigating between pages while Next.js 
 * is fetching data on the server.
 */
export default function Loading() {
    return (
        <div className="fixed inset-0 z-[100] w-full h-full flex flex-col items-center justify-center overflow-hidden bg-slate-900">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/covers/Pluragate_cover_Dark_2560x960.jpeg"
                    alt="Background"
                    fill
                    className="object-cover opacity-100"
                    priority
                    sizes="100vw"
                />
                {/* Overlay to ensure text/logo contrast and match the deep feel */}
                <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center animate-in fade-in duration-700">
                <div className="relative w-32 h-32 md:w-40 md:h-40 mb-6 drop-shadow-2xl">
                    <Image
                        src="/icons/Pluragate_512x512.svg"
                        alt="SyriaHub Logo"
                        fill
                        className="object-contain"
                        priority
                    />
                </div>

                <h1 className="text-3xl md:text-4xl font-display font-bold text-white tracking-widest drop-shadow-lg">
                    SyriaHub
                </h1>

                {/* Subtle loading indicator */}
                <div className="mt-8 flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-white/50 animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-2 h-2 rounded-full bg-white/50 animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-2 h-2 rounded-full bg-white/50 animate-bounce" />
                </div>
            </div>
        </div>
    )
}

