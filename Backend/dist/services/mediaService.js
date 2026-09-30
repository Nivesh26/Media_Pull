import path from 'path';
import { spawn } from 'child_process';
import fs from 'fs';
import { fileURLToPath } from 'url';
import ffmpegPath from 'ffmpeg-static';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
function getBinPath() {
    const possiblePaths = [
        path.resolve(__dirname, '..', '..', 'bin', 'yt-dlp'),
        path.resolve(process.cwd(), 'Backend', 'bin', 'yt-dlp'),
        path.resolve(process.cwd(), 'bin', 'yt-dlp'),
    ];
    for (const p of possiblePaths) {
        if (fs.existsSync(p))
            return p;
    }
    return 'yt-dlp';
}
const BIN_PATH = getBinPath();
const TEMP_DIR = path.resolve(process.cwd(), 'temp_downloads');
// Ensure temp directory exists
if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
}
function formatDuration(seconds) {
    if (!seconds || isNaN(seconds))
        return 'Unknown';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}
function formatViews(views) {
    if (!views || isNaN(views))
        return '';
    if (views >= 1_000_000)
        return `${(views / 1_000_000).toFixed(1)}M views`;
    if (views >= 1_000)
        return `${(views / 1_000).toFixed(0)}K views`;
    return `${views} views`;
}
function detectPlatform(url) {
    const lower = url.toLowerCase();
    if (lower.includes('instagram.com'))
        return 'instagram';
    if (lower.includes('tiktok.com'))
        return 'tiktok';
    return 'youtube';
}
export function executeYtDlp(args) {
    return new Promise((resolve, reject) => {
        const proc = spawn(BIN_PATH, args);
        let stdout = '';
        let stderr = '';
        proc.stdout.on('data', (data) => {
            stdout += data.toString();
        });
        proc.stderr.on('data', (data) => {
            stderr += data.toString();
        });
        proc.on('close', (code) => {
            if (code === 0) {
                resolve(stdout);
            }
            else {
                reject(new Error(stderr || `yt-dlp exited with code ${code}`));
            }
        });
        proc.on('error', (err) => {
            reject(err);
        });
    });
}
export async function fetchMediaInfo(url) {
    const platform = detectPlatform(url);
    // Extract info as JSON without downloading
    const output = await executeYtDlp(['--dump-json', '--no-playlist', url]);
    const data = JSON.parse(output);
    return {
        title: data.title || 'Untitled Media',
        channel: data.uploader || data.channel || data.creator || 'Unknown Creator',
        duration: formatDuration(data.duration),
        thumbnail: data.thumbnail || (data.thumbnails && data.thumbnails[0]?.url) || '',
        views: formatViews(data.view_count),
        platform,
        url,
    };
}
export async function processMediaDownload(url, format, quality = '1080p') {
    const fileId = `media_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const outputTemplate = path.join(TEMP_DIR, `${fileId}.%(ext)s`);
    let args = [];
    if (format === 'mp3') {
        // Extract audio and encode to standard QuickTime/Apple-compatible MP3
        args = [
            '-x',
            '--audio-format',
            'mp3',
            '--audio-quality',
            quality === '320k' ? '0' : '2',
            '--no-playlist',
            '-o',
            outputTemplate,
            url,
        ];
    }
    else {
        // QuickTime-compatible MP4: merge best video and audio into standard MP4
        let heightFilter = '';
        if (quality === '4K')
            heightFilter = '[height<=2160]';
        else if (quality === '1080p')
            heightFilter = '[height<=1080]';
        else if (quality === '720p')
            heightFilter = '[height<=720]';
        else if (quality === '480p')
            heightFilter = '[height<=480]';
        const formatFilter = `bestvideo${heightFilter}+bestaudio[ext=m4a]/bestvideo${heightFilter}+bestaudio/best${heightFilter}/best`;
        args = [
            '-f',
            formatFilter,
            '--merge-output-format',
            'mp4',
            '--no-playlist',
            '-o',
            outputTemplate,
            url,
        ];
    }
    // Pass ffmpeg location if available
    if (ffmpegPath) {
        args.push('--ffmpeg-location', String(ffmpegPath));
    }
    await executeYtDlp(args);
    // Find the created file in temp directory
    const files = fs.readdirSync(TEMP_DIR);
    const generatedFile = files.find((f) => f.startsWith(fileId));
    if (!generatedFile) {
        throw new Error('Downloaded file could not be found after encoding.');
    }
    const filePath = path.join(TEMP_DIR, generatedFile);
    // Get clean title for user's download filename
    let cleanTitle = 'downloaded_media';
    try {
        const info = await fetchMediaInfo(url);
        if (info.title) {
            cleanTitle = info.title.replace(/[^a-zA-Z0-9_\-\.\s]/g, '').trim().substring(0, 65);
        }
    }
    catch {
        // Fallback
    }
    const finalExt = path.extname(generatedFile) || (format === 'mp3' ? '.mp3' : '.mp4');
    const filename = `${cleanTitle}${finalExt}`;
    const contentType = format === 'mp3' ? 'audio/mpeg' : 'video/mp4';
    return {
        filePath,
        filename,
        contentType,
    };
}
