import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/User";
import { registerSchema, loginSchema } from "../schema/authSchema";
import { sendEmail } from "../utils/sendEmail";

export const register = async (req: any, res: any) => {
    try {
        const data = registerSchema.parse(req.body);
        const existingUser = await UserModel.findOne({ email: data.email });
        if (existingUser) {
            throw new Error("User already exists");
        }
        const hashedPassword = await bcrypt.hash(data.password, 10);

        const user = await UserModel.create({
            name: data.name,
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
            user.otpExpires = new Date(Date.now() + 20 * 1000);
            await user.save();

            try {
                // strict user requirement for message content
                const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); text-align: center; }
    .header h1 { color: #333; font-size: 24px; margin-bottom: 20px; display: flex; align-items: center; justify-content: center; gap: 10px; }
    .content { color: #555; font-size: 16px; line-height: 1.6; }
    .otp-box { background: linear-gradient(90deg, #6a11cb 0%, #2575fc 100%); color: white; font-size: 36px; font-weight: bold; padding: 20px 40px; border-radius: 12px; margin: 30px 0; display: inline-block; letter-spacing: 8px; box-shadow: 0 4px 10px rgba(37, 117, 252, 0.3); }
    .timer { font-size: 14px; color: #666; margin-bottom: 30px; display: flex; align-items: center; justify-content: center; gap: 6px; }
    .warning { background-color: #fff8e1; color: #856404; padding: 15px; border-radius: 8px; margin-top: 20px; font-size: 13px; text-align: center; border: 1px solid #ffeeba; display: flex; align-items: center; justify-content: center; gap: 8px; }
    .footer { margin-top: 40px; font-size: 12px; color: #aaa; border-top: 1px solid #eee; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔐 One-Time Password</h1>
    </div>
    <div class="content">
      <p style="font-size: 18px; color: #333; margin-bottom: 30px;">Hello <strong>${user.name}</strong>,</p>
      <p>your otp for secure paisa tracker is:</p>
      <div class="otp-box">${otp}</div>
      <div class="timer">
        <span>⏱️</span> Valid for 10 minutes only
      </div>
      <div class="warning">
        <span>🔒</span> Never share this code with anyone. We will never ask for it.
      </div>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Secure Paisa Tracker. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;
                await sendEmail(user.email, "Your OTP Code", `your otp for secure paisa tracker is ${otp}`, emailHtml);
            } catch (emailError) {
                console.error("Failed to send email:", emailError);
                return res.status(500).json({ error: "Failed to send OTP email" });
            }

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
                name: user.name,
                email: user.email,
                isTwoFactorEnabled: user.isTwoFactorEnabled,
                budget: user.budget,
                profilePicture: user.profilePicture
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
                name: user.name,
                email: user.email,
                isTwoFactorEnabled: user.isTwoFactorEnabled,
                budget: user.budget,
                profilePicture: user.profilePicture
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

export const updateBudget = async (req: any, res: any) => {
    try {
        const { budget } = req.body;
        const user = await UserModel.findById(req.user.id);
        if (!user) return res.status(404).json({ error: "User not found" });

        user.budget = budget;
        await user.save();

        res.json({ message: "Budget updated", budget: user.budget });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const updateProfile = async (req: any, res: any) => {
    try {
        const { name, profilePicture } = req.body;
        const user = await UserModel.findById(req.user.id);
        if (!user) return res.status(404).json({ error: "User not found" });

        if (name) user.name = name;
        if (profilePicture) user.profilePicture = profilePicture;

        await user.save();

        res.json({
            message: "Profile updated",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isTwoFactorEnabled: user.isTwoFactorEnabled,
                budget: user.budget,
                profilePicture: user.profilePicture
            }
        });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};