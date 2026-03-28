import { Router } from "express";
import { authController } from "../controllers/authController.js";

const router = Router();

router.post("/send-otp", authController.sendOtp);
router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/google", authController.googleAuth);

export default router;
