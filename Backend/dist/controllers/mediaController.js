import fs from 'fs';
import { fetchMediaInfo, processMediaDownload } from '../services/mediaService.js';
export const getMediaInfo = async (req, res) => {
    try {
        const { url } = req.body;
        if (!url || typeof url !== 'string') {
            res.status(400).json({ error: 'A valid URL is required.' });
            return;
        }
        const info = await fetchMediaInfo(url);
        res.json({ success: true, data: info });
    }
    catch (error) {
        console.error('Error fetching media info:', error);
        res.status(500).json({
            error: 'Failed to extract media information. Please verify the URL and try again.',
            details: error.message || error,
        });
    }
};
export const downloadMedia = async (req, res) => {
    try {
        const url = req.query.url;
        const format = req.query.format?.toLowerCase() === 'mp4' ? 'mp4' : 'mp3';
        const quality = req.query.quality || '1080p';
        if (!url) {
            res.status(400).json({ error: 'URL query parameter is required.' });
            return;
        }
        console.log(`Starting media encoding: format=${format}, quality=${quality}, url=${url}`);
        // Process using ffmpeg to produce QuickTime/Apple compliant MP3 or MP4
        const { filePath, filename, contentType } = await processMediaDownload(url, format, quality);
        console.log(`Media encoding complete: sending ${filename} to client.`);
        res.setHeader('Content-Type', contentType);
        res.download(filePath, filename, (err) => {
            // Clean up the temporary file immediately after sending
            fs.unlink(filePath, () => { });
            if (err) {
                if (!res.headersSent) {
                    res.status(500).json({ error: 'Failed to transmit file to client.' });
                }
            }
        });
    }
    catch (error) {
        console.error('Download processing error:', error);
        if (!res.headersSent) {
            res.status(500).json({
                error: 'Failed to process media file. Please check the URL and try again.',
                details: error.message || error,
            });
        }
    }
};
