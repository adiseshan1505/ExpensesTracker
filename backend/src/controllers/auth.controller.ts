import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/User";
import { registerSchema, loginSchema } from "../schema/authSchema";

export const register = async (req: any, res: any) => {
    try {
        const data = registerSchema.parse(req.body);
        const existingUser = await UserModel.findOne({ email: data.email });
        if (existingUser) {
            throw new Error("User already exists");
        }
        const hashedPassword = await bcrypt.hash(data.password, 10);

        const user = await UserModel.create({
            email: data.email,
            password: hashedPassword
        });
        res.json({
            message: "You are registered"
        });
    } catch (err: any) {
        res.status(400).json({
            error: err.message
        });
    }
};

export const login = async (req: any, res: any) => {
    try {
        const data = loginSchema.parse(req.body);
        const user = await UserModel.findOne({ email: data.email });
        if (!user) throw new Error("Invalid credentials");
        const isMatch = await bcrypt.compare(data.password, user.password);
        if (!isMatch) throw new Error("Invalid credentials");

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET!,
            { expiresIn: '7d' }
        );
        res.json({
            token
        });
    } catch (err: any) {
        res.status(400).json({
            error: err.message
        });
    }
};