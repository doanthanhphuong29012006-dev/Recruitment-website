import pool from "../../config/database";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const createAccount = async (fullName: string, email: string, password: string) => {
    const existEmail = await pool.query('SELECT * FROM accounts_user WHERE email = $1',
        [email]
    );
    if (existEmail.rowCount && existEmail.rowCount > 0) {
        throw new Error("Exist_Emails");
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    await pool.query('INSERT INTO accounts_user (full_name, email, password) VALUES ($1, $2, $3)',
        [fullName, email, hash]
    );
}

export const verifyLogin = async (email: string, password: string) => {
    const existEmail = await pool.query('SELECT * FROM accounts_user WHERE email=$1',
        [email]
    );

    if (existEmail.rowCount === 0) {
        throw new Error("Login_Errors");
    }

    const user = existEmail.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error("Login_Errors");
    }

    const payload = {
        userId: user.id,
        email: user.email
    }

    const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
        expiresIn: '1h'
    });

    delete user.password;

    return { user, token };
}