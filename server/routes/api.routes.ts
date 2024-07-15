import { Router } from 'express';
import authRoutes from './auth/auth.routes';
import userRoutes from './user/user.routes';

export const appApi = Router();

appApi.use('/auth', authRoutes);
appApi.use('/user', userRoutes);
