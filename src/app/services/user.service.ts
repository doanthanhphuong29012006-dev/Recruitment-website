import pool from "../../config/database";
import bcrypt from "bcryptjs";

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