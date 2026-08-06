import { Router } from "express";
import * as userController from '../controllers/user.controller';
import * as userValidate from '../validates/user.validate';

const router = Router();

router.post(
    '/register',
    userValidate.registerValidation, 
    userController.registerPost
);

router.post(
    '/login',
    userValidate.loginValidation, 
    userController.loginPost
);

export default router;