import {
  HiShieldCheck,
  HiBolt,
  HiMusicalNote,
  HiLink,
  HiArrowDownTray,
  HiSparkles,
  HiCheck,
  HiFilm,
  HiEyeSlash
} from 'react-icons/hi2'
import youtubeLogo from '../assets/youtube.svg'
import instagramLogo from '../assets/instagram.svg'
import tiktokLogo from '../assets/tiktok.svg'

interface StepItem {
  number: string
  title: string
  subtitle: string
  icon: React.ComponentType<{ className?: string }>
  badgeText: string
  actionHint: string
}

const steps: StepItem[] = [
  {
    number: '01',
    title: 'Copy & Paste Any Link',
    subtitle: 'Grab any video, Reel, or music URL from YouTube, Instagram, or TikTok and paste it into the search box.',
    icon: HiLink,
    badgeText: 'Instant Detection',
    actionHint: 'Supports YouTube, Instagram & TikTok',
  },
  {
    number: '02',
    title: 'Select MP3 or MP4',
    subtitle: 'Choose high-fidelity 320kbps MP3 audio or crystal-clear MP4 video up to 4K resolution.',
    icon: HiFilm,
    badgeText: 'Zero Quality Loss',
    actionHint: 'Auto-calculates optimal file size',
  },
  {
    number: '03',
    title: 'Direct Clean Download',
    subtitle: 'Hit Pull Media to immediately save original media files directly to your device with zero watermark.',
    icon: HiArrowDownTray,
    badgeText: 'No Watermark',
    actionHint: 'Clean output without logos or overlays',
  },
]

const features = [
  {
    title: 'No Watermarks Added',
    desc: 'Download TikTok videos and Instagram Reels without annoying platform watermarks or logos.',
    icon: HiEyeSlash,
    color: 'text-rose-600',
    bg: 'bg-rose-50',
    borderColor: 'border-rose-100',
  },
  {
    title: 'Lossless 320kbps Audio',
    desc: 'Extract full-frequency studio audio tracks and music from any video stream.',
    icon: HiMusicalNote,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    borderColor: 'border-purple-100',
  },
  {
    title: 'High-Speed Cloud Engine',
    desc: 'Powered by distributed nodes with zero queues and maximum download bandwidth.',
    icon: HiBolt,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    borderColor: 'border-amber-100',
  },
  {
    title: '100% Safe & Ad-Free',
    desc: 'Zero spam, malware, or popups. Completely safe across all devices and browsers.',
    icon: HiShieldCheck,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    borderColor: 'border-emerald-100',
  },
]

const supportedPlatforms = [
  { name: 'YouTube', type: 'Videos, Shorts & Music', logo: youtubeLogo },
  { name: 'Instagram', type: 'Reels, Stories & Posts', logo: instagramLogo },
  { name: 'TikTok', type: 'Videos Without Watermark', logo: tiktokLogo },
]

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="w-full py-16 px-4 sm:px-6 lg:px-8 scroll-mt-20">
      <div className="max-w-5xl mx-auto space-y-16">
        {/* Supported Platforms Strip */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm">
          <div className="text-center space-y-1 mb-6">
            <span className="text-[11px] font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-100/60">
              Universal Platform Compatibility
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 pt-2">
              Pull Media from All Your Favorite Platforms
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {supportedPlatforms.map((plat) => (
              <div
                key={plat.name}
                className="flex items-center gap-3.5 p-4 rounded-2xl bg-gray-50/70 border border-gray-100 hover:bg-gray-50 hover:border-gray-200 transition-colors"
              >
                <img
                  src={plat.logo}
                  alt={plat.name}
                  className="w-8 h-8 object-contain shrink-0"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-900">{plat.name}</span>
                  <span className="text-xs text-gray-500 font-normal">{plat.type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-semibold tracking-wide uppercase">
            <HiSparkles className="w-3.5 h-3.5" />
            <span>Effortless Workflow</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            How to Download in 3 Easy Steps
          </h2>
          <p className="max-w-xl mx-auto text-sm sm:text-base text-gray-500 font-normal">
            Designed for speed and simplicity. No complicated setups, just copy, select, and pull.
          </p>
        </div>

        {/* 3 Step Cards with Flow */}
        <div className="relative">
          {/* Connector Line behind steps on desktop */}
          <div className="hidden md:block absolute top-1/2 left-16 right-16 h-[2px] bg-gradient-to-r from-red-100 via-rose-100 to-red-100 -translate-y-8 z-0 pointer-events-none" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            {steps.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.number}
                  className="group bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 hover:border-red-200/70 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Top Row: Badge Number and Icon */}
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-red-50 text-red-600 border border-red-100/80">
                        STEP {item.number}
                      </span>
                      <div className="w-10 h-10 rounded-2xl bg-gray-50 group-hover:bg-red-50 text-gray-500 group-hover:text-red-600 border border-gray-100 group-hover:border-red-100 flex items-center justify-center transition-colors duration-200 shadow-2xs">
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Step Title & Subtitle */}
                    <div className="space-y-2 pt-1">
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-red-600 transition-colors duration-200">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-500 leading-relaxed font-normal">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Action Pill */}
                  <div className="pt-5 mt-5 border-t border-gray-100/80 flex items-center gap-2 text-xs font-medium text-gray-400 group-hover:text-gray-600 transition-colors">
                    <HiCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{item.actionHint}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Feature Badges Grid */}
        <div className="space-y-4 pt-4">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Why Users Choose MediaPull
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feat) => {
              const Icon = feat.icon
              return (
                <div
                  key={feat.title}
                  className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs hover:shadow-md hover:border-gray-200 transition-all duration-200 space-y-3"
                >
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center ${feat.bg} ${feat.color} border ${feat.borderColor}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">{feat.title}</h4>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{feat.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
