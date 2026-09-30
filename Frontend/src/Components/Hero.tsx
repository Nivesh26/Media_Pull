import { HiSparkles, HiShieldCheck, HiBolt, HiFilm, HiMusicalNote } from 'react-icons/hi2'

const Hero = () => {
  return (
    <section className="relative w-full pt-14 sm:pt-20 pb-8 sm:pb-10 px-4 sm:px-6 lg:px-8 text-center overflow-hidden">
      {/* Subtle Background Radial Ambient Glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] -z-10 pointer-events-none opacity-60 blur-3xl bg-gradient-to-b from-red-100/50 via-rose-50/30 to-transparent"
        aria-hidden="true"
      />

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Modern Pill Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-red-100/90 shadow-xs hover:border-red-200 transition-all duration-200">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
          </span>
          <HiSparkles className="w-3.5 h-3.5 text-red-500" />
          <span className="text-xs sm:text-sm font-semibold text-gray-800">
            Fast, Free & Unlimited Conversions
          </span>
          <span className="hidden sm:inline-block text-[11px] font-bold px-1.5 py-0.5 rounded bg-red-50 text-red-600 border border-red-100">
            v2.4
          </span>
        </div>

        {/* Main Heading */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-gray-950 tracking-tight leading-[1.15]">
          Download YouTube to{' '}
          <span className="relative inline-block text-red-600">
            <span className="bg-gradient-to-r from-red-600 via-rose-600 to-red-500 bg-clip-text text-transparent">
              MP4 & MP3
            </span>
            {/* Elegant Wavy Underline */}
            <svg
              className="absolute -bottom-2.5 sm:-bottom-3 left-0 w-full h-3 sm:h-3.5 text-red-200 pointer-events-none"
              viewBox="0 0 240 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
            >
              <path
                d="M3 8.5C18 3.5 32 3.5 48 8.5C64 13.5 78 13.5 94 8.5C110 3.5 124 3.5 140 8.5C156 13.5 170 13.5 186 8.5C202 3.5 216 3.5 237 8.5"
                stroke="currentColor"
                strokeWidth="3.2"
                strokeLinecap="round"
              />
            </svg>
          </span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl mx-auto text-base sm:text-lg text-gray-600 font-normal leading-relaxed">
          Convert your favorite videos, podcasts, and music into crisp 4K/1080p MP4
          videos or crystal-clear 320kbps MP3 audio in seconds.
        </p>

        {/* Quick Spec Highlights */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs text-gray-500 font-medium">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 border border-gray-100 shadow-2xs">
            <HiFilm className="w-3.5 h-3.5 text-red-500" />
            <span>Up to 4K 60FPS</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 border border-gray-100 shadow-2xs">
            <HiMusicalNote className="w-3.5 h-3.5 text-purple-500" />
            <span>320kbps Studio Audio</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 border border-gray-100 shadow-2xs">
            <HiBolt className="w-3.5 h-3.5 text-amber-500" />
            <span>Zero Wait Queue</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 border border-gray-100 shadow-2xs">
            <HiShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>100% Safe & Ad-Free</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
