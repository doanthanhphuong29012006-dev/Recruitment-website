import { Request, Response } from "express";
import { getCities } from '../services/city.service';

export const list = async (req: Request, res: Response): Promise<void> => {
    try {
        const cityList = await getCities();

        res.status(200).json({
            cityList: cityList
        });
    } catch (error) {
        console.error("Lỗi khi lấy danh sách tỉnh/thành phố:", error);
        
        res.status(500).json({
            message: "Đã xảy ra lỗi máy chủ nội bộ khi truy xuất danh mục."
        });
    }
}