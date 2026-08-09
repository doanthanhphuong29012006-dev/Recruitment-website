import { Request, Response, NextFunction } from "express";
import Joi from "joi";

export const registerValidation = (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
        companyName: Joi.string()
            .required()
            .min(5)
            .max(100)
            .messages({
                "string.empty": "Vui lòng nhập tên công ty!",
                "string.min": "Tên công ty phải có ít nhất 5 ký tự!",
                "string.max": "Tên công ty không được quá 100 ký tự!"
            }),
        email: Joi.string()
            .required()
            .email()
            .messages({
                "string.empty": "Vui lòng nhập email công ty!",
                "string.email": "Email không đúng định dạng!"
            }),
        password: Joi.string()
            .required()
            .min(8)
            .custom((value, helpers) => {
                if (!/[A-Z]/.test(value)) {
                    return helpers.error("password.uppercase");
                }
                if (!/[a-z]/.test(value)) {
                    return helpers.error("password.lowercase");
                }
                if (!/\d/.test(value)) {
                    return helpers.error("password.number");
                }
                if (!/[\W_]/.test(value)) {
                    return helpers.error("password.special");
                }
                return value;
            })
            .messages({
                "string.empty": "Vui lòng nhập mật khẩu!",
                "string.min": "Mật khẩu phải chứa ít nhất 8 ký tự!",
                "password.uppercase": "Mật khẩu phải chứa ít nhất 1 chữ cái in hoa!",
                "password.lowercase": "Mật khẩu phải chứa ít nhất 1 chữ cái in thường!",
                "password.number": "Mật khẩu phải chứa ít nhất 1 chữ số!",
                "password.special": "Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt!"
            })
    });

    const { error } = schema.validate(req.body);

    if (error) {
        res.status(400).json({
            message: error.details[0].message
        });

        return;
    }

    next();
}

export const loginValidation = (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
        email: Joi.string()
            .required()
            .messages({
                "string.empty": "Vui lòng nhập email công ty!"
            }),
        password: Joi.string()
            .required()
            .messages({
                "string.empty": "Vui lòng nhập mật khẩu!"
            })
    });

    const { error } = schema.validate(req.body);

    if (error) {
        res.status(400).json({
            message: error.details[0].message
        });

        return;
    }

    next();
}

export const updateProfileValidation = (req: Request, res: Response, next: NextFunction): void => {
    const schema = Joi.object({
        companyName: Joi.string()
            .required()
            .messages({
                "string.empty": "Vui lòng nhập tên công ty!"
            })
    }).unknown(true);

    const { error } = schema.validate(req.body);

    if (error) {
        res.status(400).json({
            message: error.details[0].message
        });
        return;
    }

    next();
}

export const createJobValidation = (req: Request, res: Response, next: NextFunction): void => {
    const schema = Joi.object({
        title: Joi.string()
            .required()
            .max(100)
            .messages({
                "string.empty": "Vui lòng nhập tiêu đề công việc!",
                "string.max": "Tiêu đề không được vượt quá 100 ký tự!"
            }),
        minSalary: Joi.number()
            .min(0)
            .required()
            .messages({
                "number.base": "Mức lương tối thiểu phải là một số!",
                "number.min": "Mức lương tối thiểu không được là số âm!",
                "any.required": "Vui lòng nhập mức lương tối thiểu!"
            }),
        maxSalary: Joi.number()
            .min(Joi.ref('minSalary'))
            .required()
            .messages({
                "number.base": "Mức lương tối đa phải là một số!",
                "number.min": "Mức lương tối đa phải lớn hơn hoặc bằng mức lương tối thiểu!",
                "any.required": "Vui lòng nhập mức lương tối đa!"
            }),
        level: Joi.string()
            .required()
            .max(20)
            .messages({
                "string.empty": "Vui lòng chọn cấp bậc!"
            }),
        workType: Joi.string()
            .required()
            .max(20)
            .messages({
                "string.empty": "Vui lòng chọn hình thức làm việc!"
            }),
        skills: Joi.string()
            .required()
            .messages({
                "string.empty": "Vui lòng nhập danh sách kỹ năng!"
            }),
        description: Joi.string()
            .required()
            .messages({
                "string.empty": "Vui lòng nhập mô tả chi tiết công việc!"
            })
    }).unknown(true);

    const { error } = schema.validate(req.body);

    if (error) {
        res.status(400).json({
            message: error.details[0].message
        });
        return;
    }

    next();
}