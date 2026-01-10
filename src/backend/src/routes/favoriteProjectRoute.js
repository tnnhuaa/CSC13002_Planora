import express from "express";
import { favoriteProjectController } from "../controllers/favoriteProjectController.js";
import { authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authorize("user", "admin"), favoriteProjectController.list);
router.post("/", authorize("user", "admin"), favoriteProjectController.add);
router.delete("/:projectId", authorize("user", "admin"), favoriteProjectController.remove);

export default router;
