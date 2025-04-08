import { ComPost, ComComment, ComReply } from '../models/compost.model.js';
import { Community } from '../models/community.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Create a new compost
const createCompost = async (req, res) => {
  try {
    const { title, description, community: communityId, author, media } = req.body;

    if (!title || !description || !communityId || !author) {
      console.error('Missing fields:', { title, description, communityId, author });
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Create the compost
    const compost = new ComPost({
      title,
      description,  // Changed from textSubmission to description
      community: communityId,
      author,
      media,
    });

    await compost.save();

    // Update the community's composts field
    const community = await Community.findById(communityId);
    if (!community) {
      console.error('Community not found:', communityId);
      return res.status(404).json({ error: 'Community not found' });
    }

    community.composts.push(compost._id);
    await community.save();

    res.status(201).json(compost);
  } catch (error) {
    console.error('Error creating compost:', error);
    res.status(400).json({ error: error.message });
  }
};


// Get all composts
const getAllComposts = async (req, res) => {
  try {
    const composts = await ComPost.find().populate('author', 'username').populate('community', 'communityName');
    res.status(200).json(composts);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get a single compost by ID
const getCompostById = async (req, res) => {
  try {
    const compost = await ComPost.findById(req.params.id)
      .populate({
        path: 'community',
        // Select the fields you need:
        select: ['communityName', 'removedMem', 'pendingReq'],
        // Populate the removedMem and pendingReq references if needed:
        populate: [
          {
            path: 'removedMem',
            select: 'username', // or any user fields you need
          },
          {
            path: 'pendingReq',
            select: 'username', // or any user fields you need
          }
        ],
      })
      .populate('author', 'username')
      .populate({
        path: 'comments',
        populate: {
          path: 'commentedBy',
          select: 'username',
        },
      });
    if (!compost) {
      return res.status(404).json({ error: 'Compost not found' });
    }
    res.status(200).json(compost);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get a single compost by name
const getCompostByName = async (req, res) => {
  try {
    const compost = await ComPost.findOne({ title: req.params.compostName })
      .populate('author', 'username')
      .populate('community', 'communityName');
    if (!compost) {
      return res.status(404).json({ error: 'Compost not found' });
    }
    res.status(200).json(compost);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update a compost by ID
const updateCompostById = async (req, res) => {
  try {
    const compost = await ComPost.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!compost) {
      return res.status(404).json({ error: 'Compost not found' });
    }
    res.status(200).json(compost);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a compost by ID
const deleteCompostById = async (req, res) => {
  try {
    const compost = await ComPost.findByIdAndDelete(req.params.id);
    if (!compost) {
      return res.status(404).json({ error: 'Compost not found' });
    }
    res.status(200).json({ message: 'Compost deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getCompostsByCommunityId = async (req, res) => {
  try {
    const { communityId } = req.params;
    const composts = await ComPost.find({ community: communityId }).populate('author', 'username').populate('community', 'communityName');
    if (!composts) {
      return res.status(404).json({ error: 'No composts found for this community' });
    }
    res.status(200).json(composts);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getCompostsByCommunityName = async (req, res) => {
  try {
    const { communityName } = req.params;
    const community = await Community.findOne({ communityName });
    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }
    const composts = await ComPost.find({ community: community._id }).populate('author', 'username').populate('community', 'communityName');
    res.status(200).json(composts);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const upvoteCompost = async (req, res) => {
  try {
    const compost = await ComPost.findById(req.params.id);
    if (!compost) {
      return res.status(404).json({ error: 'Compost not found' });
    }
    if (!compost.upvotedBy.includes(req.user._id)) {
      compost.upvotedBy.push(req.user._id);
      compost.pointsCount += 1;
      if (compost.downvotedBy.includes(req.user._id)) {
        compost.downvotedBy.pull(req.user._id);
        compost.pointsCount += 1;
      }
      await compost.save();
    }
    res.status(200).json(compost);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const downvoteCompost = async (req, res) => {
  try {
    const compost = await ComPost.findById(req.params.id);
    if (!compost) {
      return res.status(404).json({ error: 'Compost not found' });
    }
    if (compost.pointsCount > 0 && !compost.downvotedBy.includes(req.user._id)) {
      compost.downvotedBy.push(req.user._id);
      compost.pointsCount -= 1;
      if (compost.upvotedBy.includes(req.user._id)) {
        compost.upvotedBy.pull(req.user._id);
        compost.pointsCount -= 1;
      }
      await compost.save();
    }
    res.status(200).json(compost);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const removeUpvote = async (req, res) => {
  try {
    const compost = await ComPost.findById(req.params.id);
    if (!compost) {
      return res.status(404).json({ error: 'Compost not found' });
    }
    const index = compost.upvotedBy.indexOf(req.user._id);
    if (index > -1) {
      compost.upvotedBy.splice(index, 1);
      compost.pointsCount -= 1;
      await compost.save();
    }
    res.status(200).json(compost);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const removeDownvote = async (req, res) => {
  try {
    const compost = await ComPost.findById(req.params.id);
    if (!compost) {
      return res.status(404).json({ error: 'Compost not found' });
    }
    const index = compost.downvotedBy.indexOf(req.user._id);
    if (index > -1) {
      compost.downvotedBy.splice(index, 1);
      compost.pointsCount += 1;
      await compost.save();
    }
    res.status(200).json(compost);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const createComment = async (req, res) => {
  try {
    const { commentBody, communityId, postId } = req.body;
    const userId = req.user._id;

    console.log('postId:', postId); // Debugging statement

    if (!commentBody || typeof commentBody !== 'string') {
      return res.status(400).json({ error: 'Comment body is required and must be a string' });
    }

    // Create the comment
    const comment = new ComComment({
      commentedBy: userId,
      commentBody,
      community: communityId,
      post: postId,
    });

    await comment.save();

    // Update the post's comments field
    const post = await ComPost.findById(postId);
    if (!post) {
      console.error('Post not found:', postId); // Debugging statement
      return res.status(404).json({ error: 'Post not found' });
    }

    post.comments.push(comment._id);
    post.commentCount = (post.commentCount || 0) + 1; // increment
    await post.save();

    // Populate the commentedBy field
    await comment.populate('commentedBy', 'username');

    res.status(201).json(comment);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(400).json({ error: error.message });
  }
};

const getCommentsByPostId = async (req, res) => {
  try {
    const { id: postId } = req.params;
    const post = await ComPost.findById(postId).populate({
      path: 'comments',
      populate: [
        { path: 'commentedBy', select: 'username' },
        {
          path: 'community',
          select: ['communityName', 'removedMem', 'pendingReq'],
          populate: [
            {
              path: 'removedMem',
              select: 'username'
            },
            {
              path: 'pendingReq',
              select: 'username'
            }
          ]
        }
      ]
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.status(200).json(post.comments);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const upvoteComment = async (req, res) => {
  try {
    const comment = await ComComment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    // If user already downvoted, remove downvote and restore point
    if (comment.downvotedBy.includes(req.user._id)) {
      comment.downvotedBy.pull(req.user._id);
      comment.pointsCount += 1;
    }
    // Add upvote if not present, else remove it
    if (!comment.upvotedBy.includes(req.user._id)) {
      comment.upvotedBy.push(req.user._id);
      comment.pointsCount += 1;
    } else {
      comment.upvotedBy.pull(req.user._id);
      comment.pointsCount -= 1;
    }
    await comment.save();
    res.status(200).json(comment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


const downvoteComment = async (req, res) => {
  try {
    const comment = await ComComment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    // If user already upvoted, remove upvote and adjust point
    if (comment.upvotedBy.includes(req.user._id)) {
      comment.upvotedBy.pull(req.user._id);
      if (comment.pointsCount > 0) {
        comment.pointsCount -= 1;
      }
    }
    // Add downvote if not present and pointsCount > 0
    if (!comment.downvotedBy.includes(req.user._id) && comment.pointsCount > 0) {
      comment.downvotedBy.push(req.user._id);
      comment.pointsCount -= 1;
    } else if (comment.downvotedBy.includes(req.user._id)) {
      // Remove downvote if already downvoted
      comment.downvotedBy.pull(req.user._id);
      comment.pointsCount += 1;
    }
    await comment.save();
    res.status(200).json(comment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const removeUpvoteComment = async (req, res) => {
  try {
    const comment = await ComComment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    const index = comment.upvotedBy.indexOf(req.user._id);
    if (index > -1) {
      comment.upvotedBy.splice(index, 1);
      comment.pointsCount -= 1;
      await comment.save();
    }
    res.status(200).json(comment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const removeDownvoteComment = async (req, res) => {
  try {
    const comment = await ComComment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    const index = comment.downvotedBy.indexOf(req.user._id);
    if (index > -1) {
      comment.downvotedBy.splice(index, 1);
      comment.pointsCount += 1;
      await comment.save();
    }
    res.status(200).json(comment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const createReply = async (req, res) => {
  try {
    const { replyBody, communityId, postId } = req.body;
    const { commentId } = req.params; // Get commentId from request parameters
    const userId = req.user._id;

    if (!replyBody || typeof replyBody !== 'string') {
      return res.status(400).json({ error: 'Reply body is required and must be a string' });
    }

    // Create the reply
    const reply = new ComReply({
      repliedBy: userId,
      replyBody,
      community: communityId,
      post: postId,
      comment: commentId,
    });

    await reply.save();

    // Update the comment's replies field
    const comment = await ComComment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    comment.replies.push(reply._id);
    await comment.save();

    // Populate the repliedBy field
    await reply.populate('repliedBy', 'username');

    res.status(201).json(reply);
  } catch (error) {
    console.error('Error creating reply:', error);
    res.status(400).json({ error: error.message });
  }
};

const getRepliesByCommentId = async (req, res) => {
  try {
    const { commentId } = req.params;
    const comment = await ComComment.findById(commentId).populate({
      path: 'replies',
      populate: [
        { path: 'repliedBy', select: 'username' },
        {
          path: 'comment',
          populate: {
            path: 'community',
            select: 'communityName'
          }
        }
      ]
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    res.status(200).json(comment.replies);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const upvoteReply = async (req, res) => {
  try {
    const reply = await ComReply.findById(req.params.id);
    if (!reply) {
      return res.status(404).json({ error: 'Reply not found' });
    }
    if (!reply.upvotedBy.includes(req.user._id)) {
      reply.upvotedBy.push(req.user._id);
      reply.pointsCount += 1;
      if (reply.downvotedBy.includes(req.user._id)) {
        reply.downvotedBy.pull(req.user._id);
        reply.pointsCount += 1;
      }
      await reply.save();
    }
    res.status(200).json(reply);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const downvoteReply = async (req, res) => {
  try {
    const reply = await ComReply.findById(req.params.id);
    if (!reply) {
      return res.status(404).json({ error: 'Reply not found' });
    }
    if (reply.pointsCount > 0 && !reply.downvotedBy.includes(req.user._id)) {
      reply.downvotedBy.push(req.user._id);
      reply.pointsCount -= 1;
      if (reply.upvotedBy.includes(req.user._id)) {
        reply.upvotedBy.pull(req.user._id);
        reply.pointsCount -= 1;
      }
      await reply.save();
    }
    res.status(200).json(reply);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const removeUpvoteReply = async (req, res) => {
  try {
    const reply = await ComReply.findById(req.params.id);
    if (!reply) {
      return res.status(404).json({ error: 'Reply not found' });
    }
    const index = reply.upvotedBy.indexOf(req.user._id);
    if (index > -1) {
      reply.upvotedBy.splice(index, 1);
      reply.pointsCount -= 1;
      await reply.save();
    }
    res.status(200).json(reply);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const removeDownvoteReply = async (req, res) => {
  try {
    const reply = await ComReply.findById(req.params.id);
    if (!reply) {
      return res.status(404).json({ error: 'Reply not found' });
    }
    const index = reply.downvotedBy.indexOf(req.user._id);
    if (index > -1) {
      reply.downvotedBy.splice(index, 1);
      reply.pointsCount += 1;
      await reply.save();
    }
    res.status(200).json(reply);
  } catch (error) {
    res.status400().json({ error: error.message });
  }
};

const editCompost = async (req, res) => {
  try {
    const { title, description, media } = req.body;
    if (!title || typeof title !== 'string') {
      return res.status(400).json({ error: 'Title is required and must be a string' });
    }

    const compost = await ComPost.findByIdAndUpdate(
      req.params.id,
      { title, description, media, isEdited: true },
      { new: true, runValidators: true }
    );

    if (!compost) {
      return res.status(404).json({ error: 'Compost not found' });
    }

    res.status(200).json(compost);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const editComment = async (req, res) => {
  try {
    const { commentBody } = req.body;
    if (!commentBody || typeof commentBody !== 'string') {
      return res.status(400).json({ error: 'Comment body is required and must be a string' });
    }

    const comment = await ComComment.findByIdAndUpdate(
      req.params.id,
      { commentBody, isEdited: true },
      { new: true, runValidators: true }
    );

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    res.status(200).json(comment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const editReply = async (req, res) => {
  try {
    const { replyBody } = req.body;
    if (!replyBody || typeof replyBody !== 'string') {
      return res.status(400).json({ error: 'Reply body is required and must be a string' });
    }

    const reply = await ComReply.findByIdAndUpdate(
      req.params.id,
      { replyBody, isEdited: true },
      { new: true, runValidators: true }
    );

    if (!reply) {
      return res.status(404).json({ error: 'Reply not found' });
    }

    res.status(200).json(reply);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteReply = async (req, res) => {
  try {
    const reply = await ComReply.findByIdAndDelete(req.params.id);
    if (!reply) {
      return res.status(404).json({ error: 'Reply not found' });
    }

    // Remove the reply from the associated comment's replies array
    await ComComment.findByIdAndUpdate(reply.comment, {
      $pull: { replies: reply._id }
    });

    res.status(200).json({ message: 'Reply deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteComment = async (req, res) => {
  try {
    const comment = await ComComment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Delete associated replies
    await ComReply.deleteMany({ _id: { $in: comment.replies } });

    // Remove the comment from the associated post's comments array
    await ComPost.findByIdAndUpdate(comment.post, {
      $pull: { comments: comment._id },
      $inc: { commentCount: -1 }
    });

    await comment.deleteOne();

    res.status(200).json({ message: 'Comment and associated replies deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await ComPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Delete associated comments and their replies
    const comments = await ComComment.find({ _id: { $in: post.comments } });
    for (const comment of comments) {
      await ComReply.deleteMany({ _id: { $in: comment.replies } });
      await comment.deleteOne();
    }

    // Delete the post
    await post.deleteOne();

    res.status(200).json({ message: 'Post and associated comments and replies deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getUserCommunitiesFeed = asyncHandler(async (req, res) => {
  // Get the current user’s ID (assumes you have verifyJWT middleware populating req.user)
  const userId = req.user._id;
  
  // Get all communities that the user has joined (only need the _id)
  const joinedCommunities = await Community.find({ joinedBy: userId }).select('_id');
  const joinedIds = joinedCommunities.map(c => c._id);

  // Only show posts created in the last 10 days
  const tenDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 2000);
  
  // Query for compost posts from joined communities (sorted by createdAt descending)
  const joinedPosts = await ComPost.find({
    community: { $in: joinedIds },
    createdAt: { $gte: tenDaysAgo },
    author: { $ne: userId }, // Exclude posts created by the current user
    upvotedBy: { $ne: userId }, // Exclude posts upvoted by the current user
    downvotedBy: { $ne: userId } // Exclude posts downvoted by the current user
  })
    .populate('author', 'username')
    .populate('community', 'communityName')
    .sort({ createdAt: -1 });
  
  // Query for compost posts from communities the user has not joined (also last 10 days)
  const unjoinedPosts = await ComPost.find({
    community: { $nin: joinedIds },
    createdAt: { $gte: tenDaysAgo },
    author: { $ne: userId }, // Exclude posts created by the current user
    upvotedBy: { $ne: userId }, // Exclude posts upvoted by the current user
    downvotedBy: { $ne: userId } // Exclude posts downvoted by the current user
  })
    .populate('author', 'username')
    .populate('community', 'communityName')
    .sort({ createdAt: -1 });
  
  // Combine the feed so that joined posts come first
  const feed = [...joinedPosts, ...unjoinedPosts];
  
  res.status(200).json(feed);
});

// const searchComPosts = async (req, res) => {
//   try {
//     const { query } = req.query;
//     const composts = await ComPost.find({ title: { $regex: query, $options: 'i' } })
//       .populate('author', 'username')
//       .populate('community', 'communityName');
//     res.status(200).json(composts);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

const searchComPosts = async (req, res) => {
  try {
    const { query } = req.query;
    // e.g. partial-fuzzy match using regex on compost "title"
    const posts = await ComPost.find({
      title: { $regex: query, $options: "i" },
    })
      .populate("community", "communityName")
      .populate("author", "username")
      .limit(5);
    res.status(200).json({ posts });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

const getUserCommunityPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const posts = await ComPost.find({ author: userId })
      .populate('author', 'username')
      .populate('community', 'communityName')
      .sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export { createCompost, deleteCompostById, getAllComposts, getCompostById, 
  getCompostByName, updateCompostById, getCompostsByCommunityId, 
  getCompostsByCommunityName, upvoteCompost, downvoteCompost, 
  removeUpvote, removeDownvote, createComment, getCommentsByPostId,
  upvoteComment, downvoteComment, removeUpvoteComment, removeDownvoteComment,
  createReply, getRepliesByCommentId, upvoteReply, downvoteReply, removeUpvoteReply,
  removeDownvoteReply, editCompost, editComment, editReply, deleteReply, deleteComment, 
  deletePost, getUserCommunitiesFeed, searchComPosts, getUserCommunityPosts
};