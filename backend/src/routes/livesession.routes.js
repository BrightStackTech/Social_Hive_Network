import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createLiveSession, addParticipantToLiveSession, updateRecordingURL, getLiveSessionsHistory, updateSessionTitle, updateTerminatedAt } from "../controllers/livesession.controller.js";

const router = Router();

// Create a live session
router.post("/", verifyJWT, createLiveSession);

// Add a participant to an existing live session
router.put("/:meetingId/participant", verifyJWT, addParticipantToLiveSession);

// Update recording URL for a live session
router.put("/:meetingId/recording", verifyJWT, updateRecordingURL);

router.get("/history", verifyJWT, getLiveSessionsHistory);

// Endpoint to update session title
router.patch("/:meetingId/title", verifyJWT, updateSessionTitle);

// Endpoint to terminate session and record terminatedAt timestamp
router.patch("/:meetingId/terminate", verifyJWT, updateTerminatedAt);

export default router;