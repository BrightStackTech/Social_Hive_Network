import {Router} from 'express'
import {
    sendMessage,
    getChatMessages,
    deleteMessage
    
} from '../controllers/message.contoller.js'
import { verifyJWT } from '../middlewares/auth.middleware.js'
const router = Router()

router.use(verifyJWT)

router.route('/send-message/:chatId').post(sendMessage)
router.route('/get-messages/:chatId').get(getChatMessages)
router.route('/delete-message/:messageId').delete(deleteMessage)
export default router