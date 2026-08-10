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
        email: company.email,
        role: 'company'
    }

    const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
        expiresIn: '1h'
    });

    delete company.password;

    return { company, token };
}

export const updateProfile = async (
    id: number, 
    companyName: string, 
    phone: string, 
    address: string, 
    city: string, 
    companyModel: string, 
    companyEmployees: string, 
    workingTime: string, 
    workOvertime: string, 
    description: string, 
    logo: string | null
): Promise<void> => {
    await pool.query(
        `UPDATE accounts_company 
        SET company_name = $1,
            phone = $2,
            address = $3,
            city = $4,
            company_model = $5,
            company_employees = $6,
            working_time = $7,
            work_overtime = $8,
            description = $9,
            logo = COALESCE($10, logo), 
            updated_at = now()
        WHERE id = $11`, 
        [
            companyName, 
            phone, 
            address, 
            city, 
            companyModel, 
            companyEmployees, 
            workingTime, 
            workOvertime, 
            description, 
            logo, 
            id
        ]
    );
}

export const createJob = async (
    title: string, 
    minSalary: number, 
    maxSalary: number,
    level: string,
    workType: string,
    skills: string[],
    description: string,
    images: string[],
    companyId: number
): Promise<void> => {
    await pool.query(`
        INSERT INTO jobs (
            title,
            min_salary,
            max_salary,
            level,
            work_type,
            skills,
            description,
            images,
            company_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [
            title, 
            minSalary,
            maxSalary,
            level,
            workType,
            skills,
            description,
            images,
            companyId
        ]);
}

export const getListJob = async (
    companyId: number, 
    cityId: string, 
    logo: string, 
    companyName: string,
    limit: number,
    offset: number
) => {
    const countQuery = await pool.query('SELECT COUNT(*) FROM jobs WHERE company_id = $1', [companyId]);
    const countTotal = parseInt(countQuery.rows[0].count);

    const listJob = await pool.query(
        'SELECT * FROM jobs WHERE company_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3', 
        [companyId, limit, offset]
    );

    const cityName = cityId ||  "";

    const data = [];

    for (const job of listJob.rows) {
        data.push({
            id: job.id,
            cityName: cityName,
            logo: logo,
            title: job.title,
            companyName: companyName,
            minSalary: job.min_salary,
            maxSalary: job.max_salary,
            level: job.level,
            workType: job.work_type,
            skills: job.skills,
            createdAt: job.created_at
        });
    }

    return { data, countTotal };
}

export const getJobDetail = async (jobId: number, companyId: number) => {
    const jobQuery = await pool.query('SELECT * FROM jobs WHERE id = $1 AND company_id = $2',
        [jobId, companyId]
    );

    if (jobQuery.rowCount && jobQuery.rowCount > 0) {
        const jobDetail = jobQuery.rows[0];
        return jobDetail;
    }

    return null;
}

export const updateJob = async (
    jobId: number,
    title: string, 
    minSalary: number, 
    maxSalary: number,
    level: string,
    workType: string,
    skills: string[],
    description: string,
    images: string[] | null,
    companyId: number
): Promise<void> => {
    await pool.query(`
        UPDATE jobs SET
            title = $1,
            min_salary = $2,
            max_salary = $3,
            level = $4,
            work_type = $5,
            skills = $6,
            description = $7,
            images = COALESCE($8, images),
            updated_at = NOW()
        WHERE id = $9 AND company_id = $10
        `, [
            title, 
            minSalary,
            maxSalary,
            level,
            workType,
            skills,
            description,
            images,
            jobId,
            companyId
        ]);
}

export const deleteJob = async (jobId: number, companyId: number): Promise<void> => {
    await pool.query('DELETE FROM jobs WHERE id = $1 AND company_id = $2', [jobId, companyId]);
}