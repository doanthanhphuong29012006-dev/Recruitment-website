import { Request, Response, NextFunction } from "express";
import pool from "../../config/database";
import jwt, { JwtPayload } from "jsonwebtoken";

declare global {
    namespace Express {
        interface Request {
            user?: any,
            company?: any
        }
    }
}

interface DecodedToken extends JwtPayload {
    userId?: number,
    companyId?: number,
    email: string,
    role: string
}

export const requireAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const token = req.cookies.token;
        if (!token) {
            res.status(401).json({
                message: "Không tìm thấy token xác thực! Vui lòng đăng nhập!"
            });

            return;
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;

        if (!decoded.userId) {
            res.status(403).json({
                message: "Bạn không có quyền truy cập vào tài nguyên này!"
            });
            return;
        }

        if (decoded.role !== 'user') {
            res.status(403).json({ message: "Lỗi vượt quyền! Yêu cầu tài khoản ứng viên." });
            return;
        }

        const existUser = await pool.query('SELECT * FROM accounts_user WHERE id = $1',
            [decoded.userId]
        );

        if (existUser.rowCount === 0) {
            res.status(401).json({
                message: "Tài khoản không tồn tại hoặc đã bị khóa!"
            });

            return;
        }

        const user = existUser.rows[0];

        delete user.password;

        req.user = user;

        next();
    } catch (error) {
        console.error("Lỗi xác thực JWT:", error);
        res.status(401).json({
            message: "Tài khoản không chính xác hoặc phiên đăng nhập đã hết hạn!"
        });
    }
}

export const requireCompanyAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const token = req.cookies.token;
        if (!token) {
            res.status(401).json({
                message: "Không tìm thấy token xác thực! Vui lòng đăng nhập!"
            });

            return;
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;

        if (!decoded.companyId) {
            res.status(403).json({
                message: "Bạn không có quyền truy cập vào tài nguyên này!"
            });
            return;
        }

        if (decoded.role !== 'company') {
            res.status(403).json({ message: "Lỗi vượt quyền! Yêu cầu tài khoản nhà tuyển dụng." });
            return;
        }

        const existCompany = await pool.query('SELECT * FROM accounts_company WHERE id = $1',
            [decoded.companyId]
        );

        if (existCompany.rowCount === 0) {
            res.status(401).json({
                message: "Tài khoản không tồn tại hoặc đã bị khóa!"
            });

            return;
        }

        const company = existCompany.rows[0];

        delete company.password;

        req.company = company;

        next();
    } catch (error) {
        console.error("Lỗi xác thực JWT:", error);
        res.status(401).json({
            message: "Tài khoản không chính xác hoặc phiên đăng nhập đã hết hạn!"
        });
    }
}