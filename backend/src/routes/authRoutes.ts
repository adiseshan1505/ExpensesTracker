import { Router } from "express";
import { register, login, verifyOtp, toggleTwoFactor } from "../controllers/auth.controller";
import { protect } from "../middleware/authMiddleware";
const router = Router();
router.post("/register", register);
router.post("/login", login);
router.post("/verify-otp", verifyOtp);
router.post("/toggle-2fa", protect, toggleTwoFactor);
router.get("/me", protect, (req, res) => {
    res.json({ message: "Protected data", user: req.user });
});
export default router;