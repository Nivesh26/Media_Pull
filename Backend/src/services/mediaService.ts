import path from 'path'
import { spawn } from 'child_process'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function getBinPath(): string {
  const possiblePaths = [
    path.resolve(__dirname, '..', '..', 'bin', 'yt-dlp'),
    path.resolve(process.cwd(), 'Backend', 'bin', 'yt-dlp'),
    path.resolve(process.cwd(), 'bin', 'yt-dlp'),
  ]

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p
  }

  return 'yt-dlp'
}

const BIN_PATH = getBinPath()

export interface MediaMetadata {
  title: string
  channel: string
  duration: string
  thumbnail: string
  views: string
  platform: 'youtube' | 'instagram' | 'tiktok'
  url: string
}

function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds)) return 'Unknown'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`
}

function formatViews(views: number): string {
  if (!views || isNaN(views)) return ''
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M views`
  if (views >= 1_000) return `${(views / 1_000).toFixed(0)}K views`
  return `${views} views`
}

function detectPlatform(url: string): 'youtube' | 'instagram' | 'tiktok' {
  const lower = url.toLowerCase()
  if (lower.includes('instagram.com')) return 'instagram'
  if (lower.includes('tiktok.com')) return 'tiktok'
  return 'youtube'
}

export function executeYtDlp(args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn(BIN_PATH, args)
    let stdout = ''
    let stderr = ''

    proc.stdout.on('data', (data) => {
      stdout += data.toString()
    })

    proc.stderr.on('data', (data) => {
      stderr += data.toString()
    })

    proc.on('close', (code) => {
      if (code === 0) {
        resolve(stdout)
      } else {
        reject(new Error(stderr || `yt-dlp exited with code ${code}`))
      }
    })

    proc.on('error', (err) => {
      reject(err)
    })
  })
}

export async function fetchMediaInfo(url: string): Promise<MediaMetadata> {
  const platform = detectPlatform(url)
  // Extract info as JSON without downloading
  const output = await executeYtDlp(['--dump-json', '--no-playlist', url])
  const data = JSON.parse(output)

  return {
    title: data.title || 'Untitled Media',
    channel: data.uploader || data.channel || data.creator || 'Unknown Creator',
    duration: formatDuration(data.duration),
    thumbnail: data.thumbnail || (data.thumbnails && data.thumbnails[0]?.url) || '',
    views: formatViews(data.view_count),
    platform,
    url,
  }
}

export function streamMediaDownload(
  url: string,
  format: 'mp3' | 'mp4',
  quality: string = 'best'
) {
  let args: string[] = []

  if (format === 'mp3') {
    // Stream best audio directly
    args = [
      '-f',
      'ba/b',
      '-o',
      '-', // Stream to stdout
      '--no-playlist',
      url,
    ]
  } else {
    // Stream video directly
    // If quality is 1080p / 720p / 480p, pick best single stream with audio or fallback to best
    args = [
      '-f',
      'b[ext=mp4]/best[ext=mp4]/best',
      '-o',
      '-', // Stream to stdout
      '--no-playlist',
      url,
    ]
  }

  return spawn(BIN_PATH, args)
}
