import { Router } from 'express';
import multer from 'multer';

import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';
import MeetupAdminController from './app/controllers/MeetupAdminController';
import MeetupController from './app/controllers/MeetupController';
import SubscriptionController from './app/controllers/SubscriptionController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();

const upload = multer(multerConfig);

routes.post('/users', UserController.store);
routes.put('/users', authMiddleware, UserController.update);

routes.post('/sessions', SessionController.store);

routes.post(
  '/files',
  authMiddleware,
  upload.single('file'),
  FileController.store
);

routes.get('/meetups/admin', authMiddleware, MeetupAdminController.index);
routes.post('/meetups/admin', authMiddleware, MeetupAdminController.store);
routes.put(
  '/meetups/admin/:meetupId',
  authMiddleware,
  MeetupAdminController.update
);
routes.delete(
  '/meetups/admin/:meetupId',
  authMiddleware,
  MeetupAdminController.delete
);

routes.get('/meetups', authMiddleware, MeetupController.index);

routes.get('/subscriptions', authMiddleware, SubscriptionController.index);
routes.post(
  '/subscriptions/:meetupId',
  authMiddleware,
  SubscriptionController.store
);

export default routes;
