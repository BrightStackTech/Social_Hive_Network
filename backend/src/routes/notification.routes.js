import { Router } from "express";
import {
  sendNotification,
  storeDeviceToken,
  sendNotificationToUser
} from "../controllers/notification.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/send-notification").post(verifyJWT, sendNotification);
router.route("/store-device-token").post(verifyJWT, storeDeviceToken);
router.route("/send-notification-to-user").post(verifyJWT, sendNotificationToUser);
export default router;
