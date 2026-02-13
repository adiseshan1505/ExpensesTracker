import { Router } from "express";
import { register, login, verifyOtp, toggleTwoFactor, updateBudget, updateProfile } from "../controllers/auth.controller";
import { protect } from "../middleware/authMiddleware";
const router = Router();
router.post("/register", register);
router.post("/login", login);
router.post("/verify-otp", verifyOtp);
router.post("/toggle-2fa", protect, toggleTwoFactor);
router.put("/budget", protect, updateBudget);
router.put("/profile", protect, updateProfile);
import { UserModel } from "../models/User";

router.get("/me", protect, async (req: any, res: any) => {
    try {
        const user = await UserModel.findById(req.user.id).select("-password -otp -otpExpires");
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json({ user });
    } catch {
        res.status(500).json({ error: "Server error" });
    }
});
export default router;