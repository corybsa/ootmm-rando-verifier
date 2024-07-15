import { Router } from 'express';
import userEndpoints from './user.endpoints';

const userRoutes = Router();

userRoutes.use('/', userEndpoints);

export default userRoutes;