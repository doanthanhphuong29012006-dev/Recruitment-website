import { Request, Response } from "express";
import "multer";
import { createAccount, verifyLogin, updateProfile, createJob, getListJob, getJobDetail, updateJob, deleteJob } from '../services/company.service';

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

export const listJob = async (req: Request, res: Response): Promise<void> => {
    try {
        const companyId = req.company.id;
        const cityId = req.company.city;
        const logo = req.company.logo;
        const companyName = req.company.company_name;

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        const offset = (page - 1) * limit;

        const result = await getListJob(companyId, cityId, logo, companyName, limit, offset);

        res.status(200).json({
            message: "Lấy thành công danh sách công việc!",
            data: result.data,
            pagination: {
                currentPage: page,
                limit: limit,
                totalItem: result.countTotal,
                totalPage: Math.ceil(result.countTotal / limit)
            }
        })
    } catch (error) {
        console.error("Lỗi hệ thống khi lấy danh sách công việc:", error);
        res.status(500).json({
            message: "Đã xảy ra lỗi máy chủ nội bộ. Vui lòng thử lại sau."
        });
    }
}

export const editJob = async (req: Request, res: Response): Promise<void> => {
    try {
        const jobId = parseInt(req.params.id as string);
        const companyId = req.company.id;

        const data = await getJobDetail(jobId, companyId);

        if (!data) {
            res.status(404).json({
                message: "Không tìm thấy công việc hoặc bạn không có quyền truy cập!"
            });
            return;
        }

        res.status(200).json({
            message: "Lấy chi tiết công việc thành công!",
            data: data
        })
    } catch (error) {
        console.error("Lỗi hệ thống khi lấy chi tiết công việc:", error);
        res.status(500).json({
            message: "Đã xảy ra lỗi máy chủ nội bộ. Vui lòng thử lại sau."
        });
    }
}

export const editJobPatch = async (req: Request, res: Response): Promise<void> => {
    try {
        const jobId = parseInt(req.params.id as string);
        const companyId = req.company.id;

        req.body.minSalary = req.body.minSalary ? parseInt(req.body.minSalary) : 0;
        req.body.maxSalary = req.body.maxSalary ? parseInt(req.body.maxSalary) : 0;
        req.body.skills = req.body.skills ? req.body.skills.split(', ') : [];

        let images: string[] | null = null

        if (req.files && (req.files as any[]).length > 0) {
            images = []
            for (const file of req.files as any[]) {
                images.push(file.path);
            }
        }

        await updateJob(
            jobId,
            req.body.title, 
            req.body.minSalary, 
            req.body.maxSalary, 
            req.body.level, 
            req.body.workType, 
            req.body.skills, 
            req.body.description, 
            images,
            companyId
        );

        res.status(200).json({
            message: "Cập nhật công việc thành công!"
        })
    } catch (error) {
        console.error("Lỗi hệ thống khi lấy cập nhật công việc:", error);
        res.status(500).json({
            message: "Đã xảy ra lỗi máy chủ nội bộ. Vui lòng thử lại sau."
        });
    }
}

export const jobDelete = async (req: Request, res: Response): Promise<void> => {
    try {
        const jobId = parseInt(req.params.id as string);
        const companyId = req.company.id;

        await deleteJob(jobId, companyId);

        res.status(200).json({
            message: "Xóa công việc thành công!"
        })
    } catch (error) {
        console.error("Lỗi hệ thống khi thực hiện xóa công việc:", error);
        res.status(500).json({
            message: "Đã xảy ra lỗi máy chủ nội bộ. Vui lòng thử lại sau."
        });
    }
}