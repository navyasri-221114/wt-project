import { Router } from "express";
import { competitionController } from "../controllers/competitionController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.post("/", authenticate, competitionController.create);
router.get("/", authenticate, competitionController.getAll);
router.delete("/:id", authenticate, competitionController.delete);

export default router;
