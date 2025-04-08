import { Router } from 'express';
import {
  getChats,
  createOrGetOnetoOneChat,
  deleteChat,
  createGroupChat,
  sendMessageToFollower,
  sendMessageToGroup 
} from '../controllers/chat.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(verifyJWT);

router.route('/').get(getChats);
router.route('/c1to1').post(createOrGetOnetoOneChat);
router.route('/group/c').post(createGroupChat);
router.route('/delete-chat/:chatId').delete(deleteChat);
router.route('/send-message').post(sendMessageToFollower);
router.route('/send-message-to-group').post(sendMessageToGroup); 

export default router;