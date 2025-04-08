import {Router} from 'express'
import {
    addComment,
    deleteComment,
    getCommentsByPost
} from '../controllers/comment.controller.js'

import { verifyJWT } from '../middlewares/auth.middleware.js'

const router = Router()

router.route("/:postId").get(verifyJWT, getCommentsByPost)
router.route("/:postId").post(verifyJWT, addComment)

router.route("/:commentId").delete(verifyJWT, deleteComment)

export default router
