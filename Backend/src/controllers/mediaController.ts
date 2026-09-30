import { Request, Response } from 'express'
import { fetchMediaInfo, streamMediaDownload } from '../services/mediaService.js'

export const getMediaInfo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { url } = req.body

    if (!url || typeof url !== 'string') {
      res.status(400).json({ error: 'A valid URL is required.' })
      return
    }

    const info = await fetchMediaInfo(url)
    res.json({ success: true, data: info })
  } catch (error: any) {
    console.error('Error fetching media info:', error)
    res.status(500).json({
      error: 'Failed to extract media information. Please verify the URL and try again.',
      details: error.message || error,
    })
  }
}

export const downloadMedia = async (req: Request, res: Response): Promise<void> => {
  try {
    const url = req.query.url as string
    const format = (req.query.format as string)?.toLowerCase() === 'mp4' ? 'mp4' : 'mp3'
    const quality = (req.query.quality as string) || 'best'

    if (!url) {
      res.status(400).json({ error: 'URL query parameter is required.' })
      return
    }

    // Attempt to get title for clean filename
    let filename = `media_${Date.now()}.${format}`
    try {
      const info = await fetchMediaInfo(url)
      if (info.title) {
        // Sanitize filename for safe headers
        const sanitized = info.title.replace(/[^a-zA-Z0-9_\-\.\s]/g, '').trim().substring(0, 80)
        if (sanitized) {
          filename = `${sanitized}.${format}`
        }
      }
    } catch {
      // Fallback filename if fast metadata fails
    }

    const contentType = format === 'mp3' ? 'audio/mpeg' : 'video/mp4'

    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`)
    res.setHeader('Content-Type', contentType)

    const downloadStream = streamMediaDownload(url, format, quality)

    downloadStream.stdout.pipe(res)

    downloadStream.stderr.on('data', (data) => {
      // Log progress / debug info
      // console.log(`yt-dlp: ${data}`)
    })

    downloadStream.on('error', (err) => {
      console.error('Stream error:', err)
      if (!res.headersSent) {
        res.status(500).json({ error: 'Download stream failed.' })
      }
    })

    req.on('close', () => {
      // If client disconnects / cancels download, kill process
      downloadStream.kill()
    })
  } catch (error: any) {
    console.error('Download error:', error)
    if (!res.headersSent) {
      res.status(500).json({ error: 'Server error during media download.' })
    }
  }
}
