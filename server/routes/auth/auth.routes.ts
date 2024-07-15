import { Router } from 'express';
import authEndpoints from './auth.endpoints';

const authRoutes = Router();

authRoutes.use('/', authEndpoints);

export default authRoutes;
