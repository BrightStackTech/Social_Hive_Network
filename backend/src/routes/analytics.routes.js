import { Router } from "express";
import { getAnalytics } from "../controllers/analytics.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getTopPosts, getLowestPosts } from "../controllers/post.controller.js"

const router = Router();

router.get("/:userId", verifyJWT, getAnalytics);
router.get("/top-posts", verifyJWT, getTopPosts);
router.get("/lowest-posts", verifyJWT, getLowestPosts);

export default router;