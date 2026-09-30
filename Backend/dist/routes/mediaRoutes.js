import { Router } from 'express';
import { getMediaInfo, downloadMedia } from '../controllers/mediaController.js';
const router = Router();
router.post('/info', getMediaInfo);
router.get('/download', downloadMedia);
export default router;
