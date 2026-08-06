import { Request, Response, NextFunction } from "express";
import pool from "../../config/database";
import jwt, { JwtPayload } from "jsonwebtoken";

declare global {
    namespace Express {
        interface Request {
            user?: any
        }
    }
}

interface DecodedToken extends JwtPayload {
    userId: number,
    email: string
}

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            res.status(401).json({
                message: "Không tìm thấy token xác thực! Vui lòng đăng nhập!"
            });

            return;
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;

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