import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mediaRoutes from './routes/mediaRoutes.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5001
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*'

// Middlewares
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow curl, mobile, or requests without origin
      if (!origin) return callback(null, true)
      if (
        origin.startsWith('http://localhost:') ||
        origin.startsWith('http://127.0.0.1:') ||
        process.env.CORS_ORIGIN === '*' ||
        origin === process.env.CORS_ORIGIN
      ) {
        return callback(null, true)
      }
      callback(null, true)
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    exposedHeaders: ['Content-Disposition'],
  })
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'MediaPull Backend', timestamp: new Date() })
})

// API routes
app.use('/api', mediaRoutes)

app.listen(PORT, () => {
  console.log(`⚡ MediaPull Backend running at http://localhost:${PORT}`)
})
