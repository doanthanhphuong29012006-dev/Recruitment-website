import { Pool } from 'pg';
import dotenv from 'dotenv';

// Nạp các biến môi trường từ file .env
dotenv.config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
});

// Hàm kiểm tra kết nối
export const connectDB = async () => {
    try {
        const client = await pool.connect();
        console.log('Connected to PostgreSQL successfully!');
        client.release(); // Giải phóng client trả lại cho pool
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1); // Dừng app nếu không thể kết nối DB
    }
};

export default pool;