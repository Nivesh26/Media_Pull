import { useState, useEffect, useRef } from 'react'
import {
  HiArrowDownTray,
  HiXMark,
  HiFilm,
  HiMusicalNote,
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
    placeholder: 'Paste Instagram Reel or Post link here...',
    badge: 'Reels & Stories',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    logo: tiktokLogo,
    placeholder: 'Paste TikTok video link here...',
    badge: 'No Watermark',
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
  const abortControllerRef = useRef<AbortController | null>(null)
  const progressIntervalRef = useRef<any>(null)

  const currentMediaType = controlledMediaType ?? internalMediaType
  const [selectedQuality, setSelectedQuality] = useState('320k')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null)
  const [downloadError, setDownloadError] = useState<string | null>(null)
  const [videoData, setVideoData] = useState<VideoMetadata | null>(null)
  const [error, setError] = useState<string | null>(null)

  const activePlatformInfo = platforms.find((p) => p.id === selectedPlatform) || platforms[0]

  // Cleanup in-flight download on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort()
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
    }
  }, [])

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

  // Auto-detect platform from URL
  useEffect(() => {
    const trimmed = url.toLowerCase().trim()
    if (trimmed.includes('tiktok.com') || trimmed.includes('vt.tiktok') || trimmed.includes('vm.tiktok')) {
      setSelectedPlatform('tiktok')
      setError(null)
    } else if (trimmed.includes('instagram.com')) {
      setSelectedPlatform('instagram')
      setError(null)
    } else if (trimmed.includes('youtube.com') || trimmed.includes('youtu.be')) {
      setSelectedPlatform('youtube')
      setError(null)
    }
  }, [url])

  const handleCancelDownload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
      progressIntervalRef.current = null
    }
    setIsDownloading(false)
    setDownloadProgress(null)
    setDownloadError(null)
  }

  const handleFormatChange = (type: MediaType) => {
    handleCancelDownload()
    if (onMediaTypeChange) {
      onMediaTypeChange(type)
    } else {
      setInternalMediaType(type)
    }
    setSelectedQuality(type === 'mp4' ? '1080p' : '320k')
    setDownloadProgress(null)
    setDownloadError(null)
    setIsDownloading(false)
  }

  // Keep quality preset in sync if parent changes mediaType
  useEffect(() => {
    if (controlledMediaType) {
      handleCancelDownload()
      setSelectedQuality(controlledMediaType === 'mp4' ? '1080p' : '320k')
      setDownloadProgress(null)
      setDownloadError(null)
      setIsDownloading(false)
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
    const isTikTok = trimmed.includes('tiktok.com') || trimmed.includes('vt.tiktok') || trimmed.includes('vm.tiktok')

    if (!isYouTube && !isTikTok && !isInstagram) {
      setError('Please enter a valid YouTube, TikTok, or Instagram link.')
      return
    }

    if (isInstagram) {
      setSelectedPlatform('instagram')
    } else if (isTikTok) {
      setSelectedPlatform('tiktok')
    } else if (isYouTube) {
      setSelectedPlatform('youtube')
    }

    handleCancelDownload()
    setError(null)
    setIsProcessing(true)
    setVideoData(null)
    setDownloadProgress(null)
    setDownloadError(null)
    setIsDownloading(false)

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

  const handleStartDownload = async () => {
    if (!videoData || isDownloading) return

    handleCancelDownload()

    const abortController = new AbortController()
    abortControllerRef.current = abortController

    setIsDownloading(true)
    setDownloadProgress(8)
    setDownloadError(null)

    let currentP = 8
    progressIntervalRef.current = setInterval(() => {
      currentP += Math.floor(Math.random() * 3) + 2
      if (currentP >= 92) {
        currentP = 92
      }
      setDownloadProgress(currentP)
    }, 400)

    try {
      const downloadUrl = `${API_BASE}/download?url=${encodeURIComponent(url)}&format=${currentMediaType}&quality=${selectedQuality}`
      const response = await fetch(downloadUrl, { signal: abortController.signal })

      if (!response.ok) {
        let errMessage = 'Download failed. Please check the video link.'
        try {
          const errJson = await response.json()
          if (errJson.error) errMessage = errJson.error
        } catch {
          // ignore
        }
        throw new Error(errMessage)
      }

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
        progressIntervalRef.current = null
      }
      setDownloadProgress(100)

      const blob = await response.blob()

      let filename = `${videoData.title.replace(/[^a-zA-Z0-9_\-\.\s]/g, '').trim().substring(0, 50) || 'media'}.${currentMediaType}`
      const disposition = response.headers.get('content-disposition')
      if (disposition && disposition.includes('filename=')) {
        const matches = disposition.match(/filename="?([^";]+)"?/)
        if (matches && matches[1]) {
          filename = matches[1].replace(/['"]/g, '')
        }
      }

      // Trigger standard browser file save to user's PC
      const blobUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(blobUrl)

      setDownloadProgress(100)
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
        progressIntervalRef.current = null
      }
      setDownloadProgress(null)
      setDownloadError(err.message || 'Failed to download media file. Please check backend connection.')
    } finally {
      setIsDownloading(false)
      abortControllerRef.current = null
    }
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
                  {isDownloading ? (
                    <div className="flex items-center gap-2.5 w-full sm:w-auto">
                      {/* Vertical Liquid Loading Pill Button */}
                      <div className="relative overflow-hidden w-full sm:w-52 h-12 rounded-full bg-slate-900 border-2 border-emerald-400 shadow-lg shadow-emerald-500/20 flex items-center justify-center select-none">
                        {/* Top glass specular glare */}
                        <div className="absolute top-1 left-4 right-4 h-[2px] bg-gradient-to-r from-transparent via-white/50 to-transparent rounded-full pointer-events-none z-30" />

                        {/* Liquid Rising Vertically from Bottom to Top */}
                        <div
                          className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-emerald-600 via-emerald-500 to-emerald-400 transition-all duration-300 ease-out"
                          style={{ height: `${downloadProgress || 12}%` }}
                        >
                          {/* Liquid Surface Water Wave 1 (Back Layer) */}
                          <div className="absolute -top-3.5 left-0 w-[200%] h-4 overflow-visible pointer-events-none animate-wave-slow opacity-60">
                            <svg viewBox="0 0 1000 40" preserveAspectRatio="none" className="w-full h-full text-emerald-300 fill-current">
                              <path d="M0,20 Q125,5 250,20 T500,20 T750,20 T1000,20 L1000,40 L0,40 Z" />
                            </svg>
                          </div>

                          {/* Liquid Surface Water Wave 2 (Front Layer) */}
                          <div className="absolute -top-3 left-0 w-[200%] h-4 overflow-visible pointer-events-none animate-wave-fast opacity-95">
                            <svg viewBox="0 0 1000 40" preserveAspectRatio="none" className="w-full h-full text-emerald-400 fill-current">
                              <path d="M0,20 Q125,35 250,20 T500,20 T750,20 T1000,20 L1000,40 L0,40 Z" />
                            </svg>
                          </div>

                          {/* Rising Liquid Bubbles */}
                          <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div className="liquid-bubble w-2 h-2 left-[15%] bottom-1 animate-bubble-1" style={{ animationDelay: '0s' }} />
                            <div className="liquid-bubble w-1.5 h-1.5 left-[30%] bottom-0.5 animate-bubble-2" style={{ animationDelay: '0.6s' }} />
                            <div className="liquid-bubble w-2.5 h-2.5 left-[48%] bottom-1 animate-bubble-3" style={{ animationDelay: '1.1s' }} />
                            <div className="liquid-bubble w-1.5 h-1.5 left-[65%] bottom-0.5 animate-bubble-1" style={{ animationDelay: '1.7s' }} />
                            <div className="liquid-bubble w-2 h-2 left-[82%] bottom-1 animate-bubble-2" style={{ animationDelay: '0.4s' }} />
                          </div>
                        </div>

                        {/* Centered Percentage Text */}
                        <div className="relative z-20 flex items-center justify-center gap-2 text-white font-extrabold text-base tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
                          <HiArrowPath className="w-4 h-4 animate-spin text-white drop-shadow-[0_0_6px_rgba(52,211,153,0.9)] shrink-0" />
                          <span className="font-mono">{downloadProgress}%</span>
                        </div>
                      </div>

                      {/* Cancel Button */}
                      <button
                        type="button"
                        onClick={handleCancelDownload}
                        title="Cancel download"
                        className="flex items-center justify-center gap-1.5 px-4 h-12 rounded-full bg-gray-100 hover:bg-red-50 hover:text-red-600 active:bg-red-100 text-gray-600 font-semibold text-xs sm:text-sm transition-all duration-150 cursor-pointer border border-gray-200/80 hover:border-red-200 shrink-0"
                      >
                        <HiXMark className="w-4 h-4" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  ) : downloadProgress === 100 ? (
                    <button
                      type="button"
                      onClick={handleStartDownload}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 h-12 rounded-full bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-500/25 border-2 border-emerald-400 transition-all duration-200 cursor-pointer"
                    >
                      <HiCheck className="w-4 h-4" />
                      <span>Download Again</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleStartDownload}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 h-12 rounded-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-sm shadow-sm transition-all duration-200 cursor-pointer hover:shadow-md hover:shadow-emerald-600/20"
                    >
                      <HiArrowDownTray className="w-4 h-4" />
                      <span>Download Now</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Compact error alert if download failed */}
              {downloadError && (
                <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between gap-3 animate-fade-in">
                  <div className="flex items-center gap-2">
                    <HiExclamationTriangle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{downloadError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleStartDownload}
                    className="font-bold underline hover:no-underline shrink-0 cursor-pointer"
                  >
                    Retry
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Body
