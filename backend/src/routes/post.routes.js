import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    getPost, createPost, updatePost, deletePost, getUserPosts, searchPosts,
    likeorUnlikePost, createRePost, getLikedUsers, getRepostedUsers, sharePost,
    savePost, removeSavePost, getUserSavedPosts, getLikedPosts,
} from "../controllers/post.controller.js";

const router = Router()

router.route("/post/:postId").get(getPost)
router.route("/create").post(verifyJWT, createPost)
router.route("/update/:postId").post(verifyJWT, updatePost)
router.route("/delete/:postId").delete(verifyJWT, deletePost)
router.route("/user/:username").get(getUserPosts)
router.route("/search").get(searchPosts) // api/v1/posts/search?query=something
router.route("/like/:postId").post(verifyJWT,likeorUnlikePost)
router.route("/repost/:postId").post(verifyJWT, createRePost)
router.route("/likes/:postId").get(verifyJWT, getLikedUsers)
router.route("/reposts/:postId").get(verifyJWT, getRepostedUsers)
router.route("/:postId/share").post(verifyJWT, sharePost)
router.route("/:postId/save").post(verifyJWT, savePost)
router.route("/:postId/save").delete(verifyJWT, removeSavePost)
router.route("/saved-posts").get(verifyJWT, getUserSavedPosts)
router.route("/liked-posts").get(verifyJWT, getLikedPosts)




export default router;