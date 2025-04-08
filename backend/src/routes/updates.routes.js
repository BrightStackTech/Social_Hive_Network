import express from 'express';
import { createUpdate, getUpdates, deleteUpdateById, incrementViewCount, getViewers, hasUpdates } from '../controllers/updates.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/updates', createUpdate);
router.get('/updates/:userId', getUpdates);
router.delete('/updates/:updateId', deleteUpdateById);
router.post('/updates/:updateId/view', incrementViewCount);
router.get('/updates/:updateId/viewers', getViewers);
//router.get('/updates/followed-users-with-updates', verifyJWT, getFollowedUsersWithUpdates);
router.get('/updates/has-updates/:userId', hasUpdates); // Add this line

export default router;