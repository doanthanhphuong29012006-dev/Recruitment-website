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
    requireCompanyAuth,
    upload.single("logo"),
    companyValidate.updateProfileValidation,
    companyController.profilePatch
);

router.post(
    '/job/create', 
    requireCompanyAuth,
    upload.array("images", 6),
    companyValidate.createJobValidation,
    companyController.createJobPost
);

router.get(
    '/job/list', 
    requireCompanyAuth,
    companyController.listJob
);

router.get(
    '/job/edit/:id', 
    requireCompanyAuth,
    companyController.editJob
);

router.delete(
    '/job/delete/:id', 
    requireCompanyAuth,
    companyController.jobDelete
);

export default router;