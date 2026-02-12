import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from './routes/authRoutes';
import { connectDB } from "./config/db";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(authRoutes);
const start = async () => {
    await connectDB();
    app.listen(5000, () => console.log("API running on port 5000"));
}
start();