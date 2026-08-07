import { Router } from "express";
import userRoutes from './user.route';
import companyRoutes from "./company.route"

const router = Router();

router.use('/user', userRoutes);

router.use('/company', companyRoutes);

export default router;