import { Router } from "express";
import multer from "multer";
import { storage } from "../../../helpers/cloudinary.helper";
import { requireAuth } from "../middlewares/auth.middleware";
import * as userController from '../controllers/user.controller';
import * as userValidate from '../validates/user.validate';

const upload = multer({ storage: storage });

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

router.get('/logout', userController.logout);

router.patch(
    '/profile', 
    upload.single("avatar"),
    requireAuth,
    userController.profilePatch
);

export default router;