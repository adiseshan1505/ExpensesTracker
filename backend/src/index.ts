import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from './routes/authRoutes';
import expenseRoutes from './routes/expenseRoutes';
import { connectDB } from "./config/db";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
// Health check route (keeps Render free tier alive + fixes "Cannot GET /")
app.get("/", (req: any, res: any) => {
    res.json({ status: "ok", message: "Secure Paisa Tracker API is running" });
});

app.use(authRoutes);
app.use("/api/expenses", expenseRoutes);
const start = async () => {
    await connectDB();
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`API running on port ${PORT}`));
}
start();