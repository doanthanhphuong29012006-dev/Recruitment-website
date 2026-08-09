import { Request, Response } from "express";
import "multer";

export const imagePost = async (req: Request, res: Response): Promise<void> => {
    try {
        res.status(200).json({
            location: req?.file?.path
        });
    } catch (error) {
        console.error("Lỗi khi upload ảnh:", error);
        
        res.status(500).json({
            message: "Đã xảy ra lỗi máy chủ nội bộ khi truy xuất danh mục."
        });
    }
}