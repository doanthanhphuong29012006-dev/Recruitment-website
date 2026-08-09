import { Request, Response } from "express";
import "multer";
import { createAccount, verifyLogin, updateProfile, createJob } from '../services/company.service';

export const registerPost = async (req: Request, res: Response): Promise<void> => {
    try {
        const { companyName, email, password } = req.body;

        await createAccount(companyName, email, password);

        res.status(200).json({ 
            message: 'Đăng ký tài khoản thành công!' 
        });
    } catch (error: any) {
        if (error.message === "Exist_Emails") {
            res.status(400).json({
                message: "Tài khoản đã tồn tại!"
            });

            return;
        }

        console.error('Lỗi hệ thống trong quá trình xử lý đăng ký:', error);
        res.status(500).json({
            message: 'Đã xảy ra lỗi máy chủ nội bộ. Vui lòng thử lại sau.'
        });
    }
}

export const loginPost = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        const { company, token } = await verifyLogin(email, password);

        res.cookie("token", token, {
            maxAge: 1000 * 60 * 60,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production" ? true : false,
            sameSite: 'lax'
        });

        res.status(200).json({ 
            message: 'Đăng nhập thành công!', 
            company: company
        });
    } catch (error: any) {
        if (error.message === "Login_Errors") {
            res.status(400).json({
                message: "Email hoặc mật khẩu không chính xác!"
            });

            return;
        }

        console.error('Lỗi hệ thống trong quá trình xử lý đăng nhập:', error);
        res.status(500).json({
            message: 'Đã xảy ra lỗi máy chủ nội bộ. Vui lòng thử lại sau.'
        });
    }
}

export const logout = (req: Request, res: Response): void => {
    res.clearCookie("token");

    res.status(200).json({
        message: "Đăng xuất thành công!"
    });
}

export const profilePatch = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.company.id; 

        const { 
            companyName, 
            phone, 
            address, 
            city, 
            companyModel, 
            companyEmployees, 
            workingTime, 
            workOvertime, 
            description 
        } = req.body;

        const logo = req.file ? req.file.path : null;

        await updateProfile(
            id, 
            companyName, 
            phone, 
            address, 
            city, 
            companyModel, 
            companyEmployees, 
            workingTime, 
            workOvertime, 
            description, 
            logo
        );

        res.status(200).json({
            message: "Cập nhật thông tin công ty thành công!",
            data: {
                companyName,
                phone,
                address,
                city,
                companyModel,
                companyEmployees,
                workingTime,
                workOvertime,
                description,
                logo: logo || req.company.logo
            }
        });
    } catch (error) {
        console.error("Lỗi hệ thống khi cập nhật hồ sơ công ty:", error);
        res.status(500).json({
            message: "Đã xảy ra lỗi máy chủ nội bộ. Vui lòng thử lại sau."
        });
    }
}
export const createJobPost = async (req: Request, res: Response): Promise<void> => {
    try {
        req.body.companyId = req.company.id;
        req.body.minSalary = req.body.minSalary ? parseInt(req.body.minSalary) : 0;
        req.body.maxSalary = req.body.maxSalary ? parseInt(req.body.maxSalary) : 0;
        req.body.skills = req.body.skills ? req.body.skills.split(', ') : [];
        req.body.images = [];

        if (req.files) {
            for (const file of req.files as any[]) {
                req.body.images.push(file.path);
            }
        }

        await createJob(
            req.body.title, 
            req.body.minSalary, 
            req.body.maxSalary, 
            req.body.level, 
            req.body.workType, 
            req.body.skills, 
            req.body.description, 
            req.body.images,
            req.body.companyId
        );

        res.status(200).json({
            message: "Tạo mới công việc thành công!"
        });
    } catch (error) {
        console.error("Lỗi hệ thống khi tạo mới công việc:", error);
        res.status(500).json({
            message: "Đã xảy ra lỗi máy chủ nội bộ. Vui lòng thử lại sau."
        });
    }
}