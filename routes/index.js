// routes/index.js

import AppController from '../controllers/AppController';
import AuthController from '../controllers/AuthController';
import UsersController from '../controllers/UsersController';
import FilesController from '../controllers/FilesController';
import express from 'express';

const router = express.Router();
console.log(typeof AppController);

router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);
router.get('/connect', AuthController.getConnect);
router.get('/disconnect', AuthController.getDisconnect);
router.post('/users', UsersController.postNew);
router.get('/users/me', UsersController.getMe);
router.post('/files', FilesController.postUpload);

export default router;
