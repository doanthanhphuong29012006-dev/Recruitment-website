import { Request, Response } from "express";
import { createAccount, verifyLogin } from '../services/company.service';

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