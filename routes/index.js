// routes/index.js

import AppController from '../controllers/AppController';
import { Router } from 'express';

const router = Router();

router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);
router.get('/connect', AuthController.getConnect);
router.get('/disconnect', AuthController.getDisConnect);
router.post('/users', UsersController.postNew);
router.get('/users/me', UserCsontroller.getMe)
router.post('/files', FilesController.postUpload)

export default router;
