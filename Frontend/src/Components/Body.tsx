import { useState, useEffect, useRef } from 'react'
import {
  HiArrowDownTray,
  HiXMark,
  HiFilm,
  HiMusicalNote,
  HiCheckCircle,
  HiArrowPath,
  HiExclamationTriangle,
  HiChevronDown,
  HiCheck
} from 'react-icons/hi2'
import youtubeLogo from '../assets/youtube.svg'
import instagramLogo from '../assets/instagram.svg'
import tiktokLogo from '../assets/tiktok.svg'

type MediaType = 'mp4' | 'mp3'
type Platform = 'youtube' | 'instagram' | 'tiktok'

interface PlatformInfo {
  id: Platform
  name: string
  logo: string
  placeholder: string
  badge: string
  disabled?: boolean
  statusBadge?: string
}

const platforms: PlatformInfo[] = [
  {
    id: 'youtube',
    name: 'YouTube',
    logo: youtubeLogo,
    placeholder: 'Paste YouTube video or Shorts link here...',
    badge: '4K & MP3',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    logo: instagramLogo,
    placeholder: 'Instagram support coming soon...',
    badge: 'Reels & Stories',
    disabled: true,
    statusBadge: 'Coming Soon',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    logo: tiktokLogo,
    placeholder: 'TikTok support coming soon...',
    badge: 'No Watermark',
    disabled: true,
    statusBadge: 'Coming Soon',
  },
]

interface VideoMetadata {
  title: string
  channel: string
  duration: string
  thumbnail: string
  views: string
  platform: Platform
}

interface BodyProps {
  mediaType?: MediaType
  onMediaTypeChange?: (type: MediaType) => void
}

const Body = ({
  mediaType: controlledMediaType,
  onMediaTypeChange
}: BodyProps) => {
  const [url, setUrl] = useState('')
  const [internalMediaType, setInternalMediaType] = useState<MediaType>('mp3')
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('youtube')
  const [platformDropdownOpen, setPlatformDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const currentMediaType = controlledMediaType ?? internalMediaType
  const [selectedQuality, setSelectedQuality] = useState('320k')
  const [isProcessing, setIsProcessing] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null)
  const [videoData, setVideoData] = useState<VideoMetadata | null>(null)
  const [error, setError] = useState<string | null>(null)

  const activePlatformInfo = platforms.find((p) => p.id === selectedPlatform) || platforms[0]

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setPlatformDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Keep YouTube active and warn if user enters Instagram/TikTok for now
  useEffect(() => {
    const trimmed = url.toLowerCase().trim()
    if (trimmed.includes('instagram.com') || trimmed.includes('tiktok.com')) {
      setError('Instagram and TikTok downloads are coming soon! Currently only YouTube is supported.')
    }
  }, [url])

  const handleFormatChange = (type: MediaType) => {
    if (onMediaTypeChange) {
      onMediaTypeChange(type)
    } else {
      setInternalMediaType(type)
    }
    setSelectedQuality(type === 'mp4' ? '1080p' : '320k')
    setDownloadProgress(null)
  }

  // Keep quality preset in sync if parent changes mediaType
  useEffect(() => {
    if (controlledMediaType) {
      setSelectedQuality(controlledMediaType === 'mp4' ? '1080p' : '320k')
      setDownloadProgress(null)
    }
  }, [controlledMediaType])

  // Quality options depending on format
  const mp4Qualities = [
    { label: '4K Ultra HD', value: '4K', size: '~240 MB' },
    { label: '1080p Full HD', value: '1080p', size: '~85 MB', recommended: true },
    { label: '720p HD', value: '720p', size: '~45 MB' },
    { label: '480p SD', value: '480p', size: '~25 MB' },
  ]

  const mp3Qualities = [
    { label: '320 kbps', value: '320k', size: '~9.5 MB', recommended: true },
    { label: '256 kbps', value: '256k', size: '~7.8 MB' },
    { label: '192 kbps', value: '192k', size: '~5.9 MB' },
    { label: '128 kbps', value: '128k', size: '~4.1 MB' },
  ]

  const API_BASE = 'http://localhost:5001/api'

  const handleExtract = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!url.trim()) {
      setError(`Please enter or paste a valid ${activePlatformInfo.name} link.`)
      return
    }

    const trimmed = url.trim().toLowerCase()
    const isYouTube = /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)/i.test(trimmed) || trimmed.includes('youtube')
    const isInstagram = trimmed.includes('instagram.com')
    const isTikTok = trimmed.includes('tiktok.com')

    if (isInstagram || isTikTok) {
      setError('Instagram & TikTok downloads are coming soon! Currently, only YouTube is supported.')
      return
    }

    if (!isYouTube) {
      setError('Please enter a valid YouTube video or Shorts link.')
      return
    }

    setError(null)
    setIsProcessing(true)
    setVideoData(null)
    setDownloadProgress(null)

    try {
      const response = await fetch(`${API_BASE}/info`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to fetch video information.')
      }

      setVideoData(result.data)
      if (result.data.platform) {
        setSelectedPlatform(result.data.platform)
      }
    } catch (err: any) {
      console.error(err)
      if (err.name === 'TypeError' && (err.message?.includes('fetch') || err.message?.includes('network'))) {
        setError('Cannot reach the backend server at http://localhost:5001. Please make sure the backend is running.')
      } else {
        setError(err.message || 'Could not connect to the backend downloader service.')
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const handleStartDownload = () => {
    setDownloadProgress(0)

    // Trigger direct stream download to browser / PC
    const downloadUrl = `${API_BASE}/download?url=${encodeURIComponent(url)}&format=${currentMediaType}&quality=${selectedQuality}`
    const link = document.createElement('a')
    link.href = downloadUrl
    link.setAttribute('download', '')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev === null) return 0
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 25
      })
    }, 450)
  }

  return (
    <div id="converter-section" className="w-full pt-2 sm:pt-4 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 scroll-mt-24">
      <div className="max-w-4xl mx-auto">
        {/* Converter Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xl shadow-gray-200/40 space-y-6">
          {/* Format Selector: MP3 vs MP4 */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-gray-100">
            <div className="text-sm font-semibold text-gray-800">
              Select Output Format:
            </div>

            <div className="inline-flex p-1 rounded-xl bg-gray-100/90 border border-gray-200/60 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => handleFormatChange('mp3')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  currentMediaType === 'mp3'
                    ? 'bg-white text-red-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <HiMusicalNote className="w-4 h-4" />
                <span>MP3 Audio</span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-red-50 text-red-600">
                  Lossless
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleFormatChange('mp4')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  currentMediaType === 'mp4'
                    ? 'bg-white text-red-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <HiFilm className="w-4 h-4" />
                <span>MP4 Video</span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-red-50 text-red-600">
                  4K
                </span>
              </button>
            </div>
          </div>

          {/* URL Input Form with Interactive Platform Selector Dropdown */}
          <form onSubmit={handleExtract} className="space-y-3">
            <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <div className="relative flex-1">
                {/* Platform Selector Dropdown Trigger Button */}
                <div ref={dropdownRef} className="absolute inset-y-0 left-0 flex items-center pl-2.5 z-20">
                  <button
                    type="button"
                    onClick={() => setPlatformDropdownOpen(!platformDropdownOpen)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gray-100/90 hover:bg-gray-200/80 active:bg-gray-200 text-gray-800 transition-colors border border-gray-200/80 cursor-pointer shadow-2xs"
                    title="Choose Platform"
                  >
                    <img
                      src={activePlatformInfo.logo}
                      alt={activePlatformInfo.name}
                      className="w-5 h-5 object-contain"
                    />
                    <span className="hidden md:inline text-xs font-semibold">
                      {activePlatformInfo.name}
                    </span>
                    <HiChevronDown
                      className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 ${
                        platformDropdownOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {platformDropdownOpen && (
                    <div className="absolute top-full left-2 mt-2 w-64 bg-white rounded-2xl border border-gray-200/80 shadow-2xl p-1.5 space-y-1 z-50">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-gray-400 px-3 py-1.5">
                        Select Platform
                      </div>
                      {platforms.map((plat) => {
                        const isSelected = selectedPlatform === plat.id
                        const isDisabled = plat.disabled

                        return (
                          <button
                            key={plat.id}
                            type="button"
                            disabled={isDisabled}
                            onClick={() => {
                              if (isDisabled) return
                              setSelectedPlatform(plat.id)
                              setPlatformDropdownOpen(false)
                              setError(null)
                            }}
                            className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-colors ${
                              isDisabled
                                ? 'opacity-50 cursor-not-allowed bg-gray-50/50'
                                : isSelected
                                ? 'bg-red-50 text-red-700 font-semibold cursor-pointer'
                                : 'hover:bg-gray-50 text-gray-700 cursor-pointer'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <img
                                src={plat.logo}
                                alt={plat.name}
                                className={`w-5 h-5 object-contain ${isDisabled ? 'grayscale-[50%]' : ''}`}
                              />
                              <div className="flex flex-col">
                                <span className="text-xs font-bold leading-tight">
                                  {plat.name}
                                </span>
                                <span className="text-[10px] text-gray-400 font-normal">
                                  {plat.badge}
                                </span>
                              </div>
                            </div>

                            {isDisabled ? (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-gray-200/70 text-gray-500 border border-gray-200/80">
                                Coming Soon
                              </span>
                            ) : isSelected ? (
                              <HiCheck className="w-4 h-4 text-red-600" />
                            ) : null}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>

                <input
                  type="text"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value)
                    if (error) setError(null)
                  }}
                  placeholder={activePlatformInfo.placeholder}
                  className="w-full pl-24 md:pl-36 pr-10 py-3.5 sm:py-4 bg-gray-50/70 hover:bg-gray-50 focus:bg-white border border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-100 rounded-2xl text-gray-900 placeholder-gray-400 text-xs sm:text-sm outline-none transition-all shadow-inner"
                />

                {url && (
                  <div className="absolute inset-y-0 right-3 flex items-center z-10">
                    <button
                      type="button"
                      onClick={() => {
                        setUrl('')
                        setVideoData(null)
                        setDownloadProgress(null)
                      }}
                      className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200/60 transition-colors"
                      title="Clear"
                    >
                      <HiXMark className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="flex items-center justify-center gap-2 px-7 py-3.5 sm:py-4 bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:bg-red-400 text-white font-semibold text-sm sm:text-base rounded-2xl shadow-md shadow-red-200 transition-all cursor-pointer whitespace-nowrap"
              >
                {isProcessing ? (
                  <>
                    <HiArrowPath className="w-5 h-5 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <HiArrowDownTray className="w-5 h-5" />
                    <span>Pull Media</span>
                  </>
                )}
              </button>
            </div>

            {error && (
              <p className="text-xs sm:text-sm text-red-600 font-medium pl-1 flex items-center gap-1.5">
                <HiExclamationTriangle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{error}</span>
              </p>
            )}
          </form>

          {/* Quality Presets Selector */}
          <div className="space-y-2 pt-2">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              {currentMediaType === 'mp4' ? 'Video Resolution' : 'Audio Bitrate'}:
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {(currentMediaType === 'mp4' ? mp4Qualities : mp3Qualities).map((q) => {
                const isSelected = selectedQuality === q.value

                return (
                  <button
                    key={q.value}
                    type="button"
                    onClick={() => {
                      setSelectedQuality(q.value)
                      setDownloadProgress(null)
                    }}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'border-red-500 bg-red-50/50 text-red-700 ring-2 ring-red-500/20 shadow-xs'
                        : 'border-gray-200/80 bg-gray-50/50 hover:bg-gray-50 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-1 text-sm font-semibold">
                      <span>{q.label}</span>
                      {q.recommended && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Recommended" />
                      )}
                    </div>
                    <span className="text-[11px] text-gray-400 mt-0.5">{q.size}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Extracted Video Preview Card */}
          {videoData && (
            <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-4 animate-fade-in">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="relative w-full sm:w-44 h-28 rounded-xl overflow-hidden bg-gray-900 shrink-0 shadow-sm">
                  <img
                    src={videoData.thumbnail}
                    alt={videoData.title}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-xs text-white text-[10px] font-mono px-1.5 py-0.5 rounded">
                    {videoData.duration}
                  </span>
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <img
                      src={
                        videoData.platform === 'instagram'
                          ? instagramLogo
                          : videoData.platform === 'tiktok'
                          ? tiktokLogo
                          : youtubeLogo
                      }
                      alt={videoData.platform}
                      className="w-4 h-4 object-contain"
                    />
                    <span className="inline-block text-[11px] font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-md">
                      Ready to convert to {currentMediaType.toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-gray-900 truncate">
                    {videoData.title}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {videoData.channel} • {videoData.views}
                  </p>
                  <p className="text-xs text-gray-600 font-medium">
                    Target Format:{' '}
                    <span className="text-gray-900 font-bold uppercase">
                      {currentMediaType} ({selectedQuality})
                    </span>
                  </p>
                </div>

                <div className="w-full sm:w-auto shrink-0">
                  {downloadProgress === null ? (
                    <button
                      type="button"
                      onClick={handleStartDownload}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-sm shadow-sm transition-colors cursor-pointer"
                    >
                      <HiArrowDownTray className="w-4 h-4" />
                      <span>Download Now</span>
                    </button>
                  ) : downloadProgress < 100 ? (
                    <div className="w-full sm:w-40 space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold text-gray-700">
                        <span>Converting...</span>
                        <span>{downloadProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${downloadProgress}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-emerald-600 font-semibold text-sm bg-emerald-50 px-4 py-2.5 rounded-xl border border-emerald-200">
                      <HiCheckCircle className="w-5 h-5" />
                      <span>Completed!</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Body
