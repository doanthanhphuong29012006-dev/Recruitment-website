import express from 'express';
import cors from 'cors';
import routes from '../src/app/routes/index.route';
import { connectDB } from './config/database';

const app = express();
const PORT = process.env.PORT || 2901;

// CORS configuare
app.use(cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Cho phép gửi data lên dạng json
app.use(express.json());

// Thiết lập đường dẫn
app.use('/', routes);

app.listen(PORT, async () => {
    await connectDB();
  console.log(`Server running on http://localhost:${PORT}`);
});