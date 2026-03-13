import { Router } from "express";
import { userController } from "../controllers/userController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.get("/profile", authenticate, userController.getProfile);
router.put("/profile", authenticate, userController.updateProfile);
router.get("/students/search", authenticate, userController.searchStudents);
router.get("/students/:id", authenticate, userController.getStudentById);
router.get("/companies", authenticate, userController.getAllCompanies);

export default router;
