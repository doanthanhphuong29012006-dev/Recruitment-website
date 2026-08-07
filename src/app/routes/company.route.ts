import { Router } from "express";
import * as companyController from '../controllers/company.controller';
import * as companyValidate from '../validates/company.validate';

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

export default router;