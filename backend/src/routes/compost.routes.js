import { Router } from 'express';
import {
  createCompost,
  getAllComposts,
  getCompostById,
  getCompostByName,
  updateCompostById,
  deleteCompostById,
  getCompostsByCommunityId,
  getCompostsByCommunityName,
  upvoteCompost,
  downvoteCompost,
  removeUpvote,
  removeDownvote,
  createComment,
  getCommentsByPostId,
  upvoteComment,
  downvoteComment,
  removeUpvoteComment,
  removeDownvoteComment,
  createReply,
  getRepliesByCommentId,
  upvoteReply, // Add this line
  downvoteReply, // Add this line
  removeUpvoteReply, // Add this line
  removeDownvoteReply, // Add this line
  editCompost,
  editComment,
  editReply,
  deleteReply,
  deleteComment,
  deletePost,
  getUserCommunitiesFeed,
  searchComPosts,
  getUserCommunityPosts,
} from '../controllers/compost.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { ComPost } from '../models/compost.model.js'; 

const router = Router();


router.route('/create-compost').post(verifyJWT, createCompost);
router.route('/user-feed').get(verifyJWT, getUserCommunitiesFeed);
router.route('/name/:compostName').get(getCompostByName);
router.route("/search").get(searchComPosts);
router.route('/').get(getAllComposts);
router.route('/:id').get(getCompostById).put(verifyJWT, updateCompostById).delete(verifyJWT, deleteCompostById);
router.route('/community-id/:communityId').get(getCompostsByCommunityId);
router.route('/community-name/:communityName').get(getCompostsByCommunityName);
router.route('/:id/upvote').post(verifyJWT, upvoteCompost);
router.route('/:id/downvote').post(verifyJWT, downvoteCompost);
router.route('/:id/remove-upvote').post(verifyJWT, removeUpvote);
router.route('/:id/remove-downvote').post(verifyJWT, removeDownvote);
router.route('/:id/comments').post(verifyJWT, createComment);
router.route('/:id/comments').get(getCommentsByPostId);
router.route('/comments/:id/upvote').post(verifyJWT, upvoteComment);
router.route('/comments/:id/downvote').post(verifyJWT, downvoteComment);
router.route('/comments/:id/remove-upvote').post(verifyJWT, removeUpvoteComment);
router.route('/comments/:id/remove-downvote').post(verifyJWT, removeDownvoteComment);
router.route('/comments/:commentId/replies').post(verifyJWT, createReply);
router.route('/comments/:commentId/replies').get(verifyJWT, getRepliesByCommentId);
router.route('/replies/:id/upvote').post(verifyJWT, upvoteReply); // Add this line
router.route('/replies/:id/downvote').post(verifyJWT, downvoteReply); // Add this line
router.route('/replies/:id/remove-upvote').post(verifyJWT, removeUpvoteReply); // Add this line
router.route('/replies/:id/remove-downvote').post(verifyJWT, removeDownvoteReply); // Add this line
router.route('/:id/edit').put(verifyJWT, editCompost);
router.route('/comments/:id/edit').put(verifyJWT, editComment);
router.route('/replies/:id/edit').put(verifyJWT, editReply);
router.route('/replies/:id/delete').delete(verifyJWT, deleteReply);
router.route('/comments/:id/delete').delete(verifyJWT, deleteComment);
router.route('/posts/:id/delete').delete(verifyJWT, deletePost);
router.route('/user/:userId/community-posts').get(verifyJWT, getUserCommunityPosts);

export default router;