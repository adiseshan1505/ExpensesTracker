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

        if (user.isTwoFactorEnabled) {
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            user.otp = otp;
            user.otpExpires = new Date(Date.now() + 10 * 60000); // 10 mins
            await user.save();

            // In a real app, send email here
            console.log(`OTP for ${user.email}: ${otp}`);

            return res.json({
                twoFactorRequired: true,
                message: "OTP sent to your email"
            });
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET!,
            { expiresIn: '7d' }
        );
        res.json({
            token,
            user: {
                id: user._id,
                email: user.email,
                isTwoFactorEnabled: user.isTwoFactorEnabled
            }
        });
    } catch (err: any) {
        res.status(400).json({
            error: err.message
        });
    }
};

export const verifyOtp = async (req: any, res: any) => {
    try {
        const { email, otp } = req.body;
        const user = await UserModel.findOne({ email });

        if (!user || user.otp !== otp || (user.otpExpires && user.otpExpires < new Date())) {
            return res.status(400).json({ error: "Invalid or expired OTP" });
        }

        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET!,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                email: user.email,
                isTwoFactorEnabled: user.isTwoFactorEnabled
            }
        });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const toggleTwoFactor = async (req: any, res: any) => {
    try {
        const user = await UserModel.findById(req.user.id);
        if (!user) return res.status(404).json({ error: "User not found" });

        user.isTwoFactorEnabled = !user.isTwoFactorEnabled;
        await user.save();

        res.json({
            message: `Two-Factor Authentication ${user.isTwoFactorEnabled ? "enabled" : "disabled"}`,
            isTwoFactorEnabled: user.isTwoFactorEnabled
        });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};