import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mediaRoutes from './routes/mediaRoutes.js';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
// Middlewares
app.use(cors({
    origin: CORS_ORIGIN,
    methods: ['GET', 'POST'],
    exposedHeaders: ['Content-Disposition'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'MediaPull Backend', timestamp: new Date() });
});
// API routes
app.use('/api', mediaRoutes);
app.listen(PORT, () => {
    console.log(`⚡ MediaPull Backend running at http://localhost:${PORT}`);
});
