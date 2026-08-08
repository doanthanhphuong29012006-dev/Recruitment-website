import { Router } from "express";
import multer from "multer";
import { storage } from "../../../helpers/cloudinary.helper";
import { requireCompanyAuth } from "../middlewares/auth.middleware";
import * as companyController from '../controllers/company.controller';
import * as companyValidate from '../validates/company.validate';

const upload = multer({ storage: storage });

const router = Router();

router.post(
    '/register',
    companyValidate.registerValidation, 
    companyController.registerPost
);

router.post(
    '/login',
    companyValidate.loginValidation, 
    companyController.loginPost
);

router.get('/logout', companyController.logout);

router.patch(
    '/profile', 
    upload.single("logo"),
    requireCompanyAuth,
    companyValidate.updateProfileValidation,
    companyController.profilePatch
);

export default router;