import { useState, useEffect } from 'react'
import {
  HiArrowDownTray,
  HiXMark,
  HiFilm,
  HiMusicalNote,
  HiCheckCircle,
  HiArrowPath
} from 'react-icons/hi2'
import { RiYoutubeFill } from 'react-icons/ri'

type MediaType = 'mp4' | 'mp3'

interface VideoMetadata {
  title: string
  channel: string
  duration: string
  thumbnail: string
  views: string
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
  const [internalMediaType, setInternalMediaType] = useState<MediaType>('mp4')
  
  const currentMediaType = controlledMediaType ?? internalMediaType
  const [selectedQuality, setSelectedQuality] = useState('1080p')
  const [isProcessing, setIsProcessing] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null)
  const [videoData, setVideoData] = useState<VideoMetadata | null>(null)
  const [error, setError] = useState<string | null>(null)

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

  const handleExtract = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!url.trim()) {
      setError('Please enter or paste a valid YouTube video URL.')
      return
    }

    // Basic YouTube URL verification
    const isYouTubeUrl = /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)/i.test(url)
    if (!isYouTubeUrl && !url.includes('youtube')) {
      setError('Please enter a valid YouTube link (e.g. https://www.youtube.com/watch?v=...)')
      return
    }

    setError(null)
    setIsProcessing(true)
    setVideoData(null)
    setDownloadProgress(null)

    // Simulate intelligent metadata fetch
    setTimeout(() => {
      setIsProcessing(false)
      setVideoData({
        title: 'Lofi Hip Hop Radio - Beats to Relax/Study to [High Fidelity Audio]',
        channel: 'Lofi Girl',
        duration: '3:45',
        thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
        views: '1.4M views'
      })
    }, 900)
  }

  const handleStartDownload = () => {
    setDownloadProgress(0)
    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev === null) return 0
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 25
      })
    }, 350)
  }

  return (
    <div id="converter-section" className="w-full pt-2 sm:pt-4 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 scroll-mt-24">
      <div className="max-w-4xl mx-auto">
        {/* Converter Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xl shadow-gray-200/40 space-y-6">
          {/* Format Selector: MP4 vs MP3 */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-gray-100">
            <div className="text-sm font-semibold text-gray-800">
              Select Output Format:
            </div>

            <div className="inline-flex p-1 rounded-xl bg-gray-100/90 border border-gray-200/60 w-full sm:w-auto">
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
            </div>
          </div>

          {/* URL Input Form */}
          <form onSubmit={handleExtract} className="space-y-3">
            <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-red-500">
                  <RiYoutubeFill className="w-6 h-6" />
                </div>

                <input
                  type="text"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value)
                    if (error) setError(null)
                  }}
                  placeholder="Paste YouTube link here (e.g. https://www.youtube.com/watch?v=...)"
                  className="w-full pl-12 pr-10 py-3.5 sm:py-4 bg-gray-50/70 hover:bg-gray-50 focus:bg-white border border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-100 rounded-2xl text-gray-900 placeholder-gray-400 text-sm sm:text-base outline-none transition-all shadow-inner"
                />

                {url && (
                  <div className="absolute inset-y-0 right-3 flex items-center">
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
                <span>⚠️</span> {error}
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
                  <span className="inline-block text-[11px] font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-md">
                    Ready to convert to {currentMediaType.toUpperCase()}
                  </span>
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
