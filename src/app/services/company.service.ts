import pool from "../../config/database";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const createAccount = async (companyName: string, email: string, password: string) => {
    const existEmail = await pool.query('SELECT * FROM accounts_company WHERE email = $1',
        [email]
    );
    if (existEmail.rowCount && existEmail.rowCount > 0) {
        throw new Error("Exist_Emails");
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    await pool.query('INSERT INTO accounts_company (company_name, email, password) VALUES ($1, $2, $3)',
        [companyName, email, hash]
    );
}

export const verifyLogin = async (email: string, password: string) => {
    const existEmail = await pool.query('SELECT * FROM accounts_company WHERE email=$1',
        [email]
    );

    if (existEmail.rowCount === 0) {
        throw new Error("Login_Errors");
    }

    const company = existEmail.rows[0];

    const isMatch = await bcrypt.compare(password, company.password);
    if (!isMatch) {
        throw new Error("Login_Errors");
    }

    const payload = {
        companyId: company.id,
        email: company.email
    }

    const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
        expiresIn: '1h'
    });

    delete company.password;

    return { company, token };
}