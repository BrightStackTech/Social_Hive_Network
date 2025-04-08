import {Post} from '../models/post.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { User } from '../models/user.model.js';
import { postKeywords } from '../constants.js';
import * as mongoose from 'mongoose';
import { Filter } from 'bad-words'
import Analytics from '../models/analytics.model.js';

//create a new post
const createPost = asyncHandler(async (req, res) => {
    const filter = new Filter()
    const {title, content, isPublic, onlyFollowers, media} = req.body;
    //validate the input fields
    if(!title || !content){
        throw new ApiError(400, "Title and content are required");
    }
    if(filter.isProfane(title) || filter.isProfane(content)){
        console.log("Profanity detected");
        throw new ApiError(402, "Profanity is not allowed in title or content");
    }
    const contentWords = content.toLowerCase().split(/\W+/);
    const titleWords = title.toLowerCase().split(/\W+/);
    const unionWords = [...new Set([...contentWords, ...titleWords])];
    const tags = postKeywords.filter(keyword => unionWords.includes(keyword)); 
    tags.push(req.user.engineeringDomain)    
    tags.push(req.user.college)

    //create a new post
    const post = await Post.create({
        title,
        content,
        tags,
        public: isPublic,
        onlyFollowers,
        createdBy: req.user._id,
        media
    });

    if(!post){
        throw new ApiError(500, "Something went wrong while creating the post");
    }
    //add the post to the user's posts array
    const user = await User.findById(req.user._id);
    user.posts.push(post._id);
    await user.save({ validateBeforeSave: false });
  
    const today = new Date().toISOString().split("T")[0];
    let analyticsRecord = await Analytics.findOne({ userId: post.createdBy, date: today });
    if (!analyticsRecord) {
      analyticsRecord = new Analytics({ userId: post.createdBy });
    }
    analyticsRecord.newPosts += 1;
    await analyticsRecord.save();
    //return the response
    return res.status(201).json(new ApiResponse(201, post, "Post created successfully"));
    
})


const getPost = asyncHandler(async (req, res) => {
    const {postId} = req.params;
    //validate the input fields
    if(!postId){
        throw new ApiError(400, "Post id is required");
    }
    //find the post
    const post = await Post.
    aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(postId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "createdBy",
                foreignField: "_id",
                as: "createdBy"
            }
        },
        {
            $unwind: "$createdBy"
        },
        {
            $project: {
                _id: 1,
                title: 1,
                content: 1,
                media:1,
                tags: 1,
                public: 1,
                onlyFollowers: 1,
                createdAt: 1,
                createdBy: {
                    _id: 1,
                    username: 1,
                    email: 1,
                    profilePicture: 1
                },
                likes:1,
                comments:1,
                savedBy:1
            
            }
        }
    ]);
    if(!post){
        throw new ApiError(404, "Post not found");
    }
    //return the response
    return res.status(200).json(new ApiResponse(200, post[0], "Post fetched successfully"));
})

const updatePost = asyncHandler(async (req, res) => {
    const {postId} = req.params;
    const {title, content, tags, isPublic, onlyFollowers} = req.body;
    //validate the input fields
    if(!postId){
        throw new ApiError(400, "Post id is required");
    }
    //find the post
    const post = await Post.findById(postId);
    if(!post){
        throw new ApiError(404, "Post not found");
    }
    //update the post
    post.title = title || post.title;
    post.content = content || post.content;
    post.tags = tags || post.tags;
    post.public = isPublic || post.public;
    post.onlyFollowers = onlyFollowers || post.onlyFollowers;
    //save the post
    const updatedPost = await post.save();
    //return the response
    return res.status(200).json(new ApiResponse(200, updatedPost, "Post updated successfully"));
})
const getUserPosts = asyncHandler(async (req, res) => {
    const { username } = req.params;
  
    // Ensure the username is provided
    if (!username?.trim()) {
      throw new ApiError(400, "Username is required");
    }
  
    // Find the user by their username
    const user = await User.findOne({ username }).select("_id");
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    
  
    // Aggregate posts created by or reposted by the user
    const posts = await Post.aggregate([
      {
        $match: {
          $or: [
            { createdBy: user._id },  // Original posts
            // { repostedBy: user._id }, // Reposts
          ]
        }
      },
      {
        $lookup: {
          from: "posts",              // Join with the same Post collection
          localField: "repostedFrom", // Use repostedFrom as the join key
          foreignField: "_id",        // Match the _id of the original post
          as: "repostedPost",         // Alias the result as repostedPost
        }
      },
      { $unwind: { path: "$repostedPost", preserveNullAndEmptyArrays: true } }, // Unwind to make repostedPost a single object
      {
        $lookup: {
          from: "users",               // Join with User collection for post creators
          localField: "createdBy",
          foreignField: "_id",
          as: "createdBy"
        }
      },
      { $unwind: "$createdBy" },       // Unwind createdBy to make it a single object
      {
        $lookup: {
          from: "users",               // Join with User collection for the reposted post's creator
          localField: "repostedPost.createdBy",
          foreignField: "_id",
          as: "repostedPost.createdBy"
        }
      },
      { $unwind: { path: "$repostedPost.createdBy", preserveNullAndEmptyArrays: true } }, // Unwind repostedPost's createdBy
      {
        $project: {
          // Project only the necessary fields
          title: 1,
              content: 1,
                media:1,
          createdAt: 1,
          createdBy: { _id: 1, username: 1, email: 1, profilePicture: 1 }, // Original post creator
          repostedPost: {
            _id: 1,
            title: 1,
            content: 1,
            media:1,
            createdBy: { _id: 1, username: 1, email: 1, profilePicture: 1 }, // Reposted post creator
            createdAt: 1,
            likes: 1,
            comments: 1,
              repostedBy: 1,
              savedBy: 1,
            sharedBy: 1
          },
          isRepost: 1,
          repostedFrom: 1, // Optionally include repostedFrom ID
          comments: 1,
          likes: 1,
          tags: 1,
          public: 1,
              repostedBy: 1,
              savedBy: 1,
          sharedBy: 1
        }
      },
      { $sort: { createdAt: -1 } } // Sort by creation date (newest first)
    ]);
  
    return res
      .status(200)
      .json(new ApiResponse(200, posts, "User posts fetched successfully"));
  });
  
  


const deletePost = asyncHandler(async (req, res) => {
    const {postId} = req.params;
    //validate the input fields
    if(!postId){
        throw new ApiError(400, "Post id is required");
    }
    //find the post
    const post = await Post.findById(postId);
    if(!post){
        throw new ApiError(404, "Post not found");
    }
    //delete the post
    const deletedPost = await Post.findByIdAndDelete(postId);
    //return the response
    return res.status(200).json(new ApiResponse(200, deletedPost, "Post deleted successfully"));
})

const searchPosts = asyncHandler(async (req, res) => {
    const {query} = req.query;
    //validate the input fields
    if(!query?.trim()){
        throw new ApiError(400, "Search query is required");
    }
    //find the posts
    const posts = await Post
    .find({
        $or: [
            {title: {$regex: query, $options: "i"}},
            {content: {$regex: query, $options: "i"}},
            {tags: {$regex: query, $options: "i"}}
        ],
        public: true,
        onlyFollowers: false
    })
    .populate({
        path: "createdBy",
        select: "username email profilePicture"
    })
    .sort({createdAt: -1});
    if(!posts){
        throw new ApiError(404, "No posts found");
    }
    const postsCount = posts.length;
    //return the response
    return res.status(200).json(new ApiResponse(200, {posts, postsCount}, "Posts fetched successfully"));
})

const likeorUnlikePost = asyncHandler(async (req, res) => {
    const {postId} = req.params;
    //validate the input fields
    if(!postId){
        throw new ApiError(400, "Post id is required");
    }
    //find the post
    const post = await Post.findById(postId);
    if(!post){
        throw new ApiError(404, "Post not found");
    }
    //check if userid is already present post.likes
    if (post.likes.includes(req.user._id)) {
        // Unlike the post.
        post.likes = post.likes.filter((id) => id.toString() !== req.user._id.toString());
        
        // Update analytics: decrement totalLikes
        const today = new Date().toISOString().split("T")[0];
        let analyticsRecord = await Analytics.findOne({ userId: post.createdBy, date: today });
        if (analyticsRecord) {
          analyticsRecord.totalLikes = Math.max((analyticsRecord.totalLikes || 0) - 1, 0);
          await analyticsRecord.save();
        }
    } else {
        // Like the post.
        post.likes.push(req.user._id);
        
        // Update analytics: increment totalLikes
        const today = new Date().toISOString().split("T")[0];
        let analyticsRecord = await Analytics.findOne({ userId: post.createdBy, date: today });
        if (!analyticsRecord) {
          analyticsRecord = new Analytics({ userId: post.createdBy });
        }
        analyticsRecord.totalLikes = (analyticsRecord.totalLikes || 0) + 1;
        await analyticsRecord.save();
    }
    
    //save the post
    const updatedPost = await post.save();
    const updatedLikesCount = updatedPost.likes.length;
    //return the response
    return res.status(200).json(new ApiResponse(200, updatedLikesCount, "Post liked/disliked successfully"));
})

const createRePost = asyncHandler(async (req, res) => {
    const {postId} = req.params;
    //validate the input fields
    if(!postId){
        throw new ApiError(400, "Post id is required");
    }
    //find the post
    const post = await Post.findById(postId);
    if(!post){
        throw new ApiError(404, "Post not found");
    }

    if(post.repostedBy.includes(req.user._id)){
        // throw new ApiError(400, "You have already re-posted this post");
        
        const repostedPost = await Post.find({isRepost: true, repostedFrom: postId, createdBy: req.user._id});
        await post.updateOne({$pull: {repostedBy: req.user._id}});
        await Post.deleteMany({isRepost: true, repostedFrom: postId, createdBy: req.user._id});
        await User.updateOne({_id: req.user._id}, {$pull: {posts: repostedPost[0]._id}});
        post.repostedBy = post.repostedBy.filter((id) => id.toString() !== req.user._id.toString());
        const repostLength = post.repostedBy.length;
        return res.status(200).json(new ApiResponse(200, {repostLength}, "Re-post removed successfully"));
    }
    //create a new post
    const rePost = await Post.create({
        isRepost: true,
        repostedFrom: postId,
        createdBy: req.user._id
    });
    if(!rePost){
        throw new ApiError(500, "Something went wrong while creating the re-post");
    }
    //add the post to the user's posts array
    const user = await User.findById(req.user._id);
    user.posts.push(rePost._id);
    await user.save({validateBeforeSave:false});

    post.repostedBy.push(req.user._id);
    const repostLength = post.repostedBy.length;
    await post.save({validateBeforeSave:false});

    //return the response
    return res.status(200).json(new ApiResponse(200, {rePost, repostLength}, "Re-post created successfully"));

})


const getLikedUsers = asyncHandler(async (req, res) => {
    const {postId} = req.params;
    if(!postId){
        throw new ApiError(400, "Post id is required");
    }
    const likedUsers = await Post.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(postId)
            }
        },
        {
            $project: {
                likes: 1
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "likes",
                foreignField: "_id",
                as: "likedUser"
            }
        },
        {
            $unwind: "$likedUser"
        },
        {
            $project: {
                _id: "$likedUser._id",
                username: "$likedUser.username",
                email: "$likedUser.email",
                profilePicture: "$likedUser.profilePicture"
            }
        }
    ]);
    return res.status(200).json(new ApiResponse(200, likedUsers, "Liked users fetched successfully"));
})

const getRepostedUsers = asyncHandler(async (req, res) => {
    const {postId} = req.params;
    if(!postId){
        throw new ApiError(400, "Post id is required");
    }
    const repostedUsers = await Post.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(postId)
            }
        },
        {
            $project: {
                repostedBy: 1
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "repostedBy",
                foreignField: "_id",
                as: "repostedUser"
            }
        },
        {
            $unwind: "$repostedUser"
        },
        {
            $project: {
                _id: "$repostedUser._id",
                username: "$repostedUser.username",
                email: "$repostedUser.email",
                profilePicture: "$repostedUser.profilePicture"
            }
        }
    ]);
    return res.status(200).json(new ApiResponse(200, repostedUsers, "Reposted users fetched successfully"));
})

// Existing controller: sharePost (unchanged)
const sharePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  if (!postId) {
    throw new ApiError(400, "Post id is required");
  }
  const post = await Post.findById(postId);
  if (!post) {
    throw new ApiError(404, "Post not found");
  }
  // Add users id to sharedBy if not already present
  if (!post.sharedBy.includes(req.user._id)) {
    post.sharedBy.push(req.user._id);
    await post.save({ validateBeforeSave: false });
    
    // Update analytics for share count
    const today = new Date().toISOString().split("T")[0];
    let analyticsRecord = await Analytics.findOne({ userId: post.createdBy, date: today });
    if (!analyticsRecord) {
      analyticsRecord = new Analytics({ userId: post.createdBy });
    }
    analyticsRecord.totalShares = (analyticsRecord.totalShares || 0) + 1;
    await analyticsRecord.save();
  }
  const sharedCount = post.sharedBy.length;
  return res.status(200).json(new ApiResponse(200, { sharedCount }, "Post shared successfully"));
});

// Existing controller: savePost (unchanged)
const savePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  if (!postId) {
    throw new ApiError(400, "Post id is required");
  }
  const post = await Post.findById(postId);
  if (!post) {
    throw new ApiError(404, "Post not found");
  }
  // Add current user's id to post's savedBy array if not already added
  if (!post.savedBy.includes(req.user._id)) {
    post.savedBy.push(req.user._id);
    await post.save({ validateBeforeSave: false });
  }
  // Also, add the post id to the user's savedPosts array
  const user = await User.findById(req.user._id);
  if (!user.savedPosts.includes(post._id)) {
    user.savedPosts.push(post._id);
    await user.save({ validateBeforeSave: false });
  }
  return res.status(200).json(new ApiResponse(200, { postId, userId: req.user._id }, "Post saved successfully"));
});

// NEW controller: removeSavePost - unsave a post
const removeSavePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  if (!postId) {
    throw new ApiError(400, "Post id is required");
  }
  const post = await Post.findById(postId);
  if (!post) {
    throw new ApiError(404, "Post not found");
  }
  // Remove user's id from savedBy array if present
  const savedIndex = post.savedBy.indexOf(req.user._id);
  if (savedIndex > -1) {
    post.savedBy.splice(savedIndex, 1);
    await post.save({ validateBeforeSave: false });
  }
  // Remove post id from user's savedPosts array
  const user = await User.findById(req.user._id);
  const userIndex = user.savedPosts.indexOf(post._id);
  if (userIndex > -1) {
    user.savedPosts.splice(userIndex, 1);
    await user.save({ validateBeforeSave: false });
  }
  return res.status(200).json(new ApiResponse(200, { postId, userId: req.user._id }, "Post unsaved successfully"));
});

const getUserSavedPosts = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('savedPosts');
  const savedPosts = await Post.find({ _id: { $in: user.savedPosts } })
    .populate('createdBy', 'username email profilePicture')
    .exec();
  return res.status(200).json(new ApiResponse(200, savedPosts, "User's saved posts fetched successfully"));
});

const getLikedPosts = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const likedPosts = await Post.find({ likes: userId })
    .populate('createdBy', 'username email profilePicture')
    .exec();
  return res.status(200).json(new ApiResponse(200, likedPosts, "Liked posts fetched successfully"));
});


// Get top posts based on likes, comments or shares
const getTopPosts = asyncHandler(async (req, res) => {
    const { period, type } = req.query; // period: daily|weekly|monthly|yearly|all; type: likes|comments|shares
    let startDate = null;
    const now = new Date();

    if (period === 'daily') {
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    } else if (period === 'weekly') {
        startDate = new Date(now.setDate(now.getDate() - 7));
    } else if (period === 'monthly') {
        startDate = new Date(now.setMonth(now.getMonth() - 1));
    } else if (period === 'yearly') {
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
    } else if (period !== 'all') {
        throw new ApiError(400, "Invalid period parameter. Use daily, weekly, monthly, yearly or all.");
    }

    if (!['likes', 'comments', 'shares'].includes(type)) {
        throw new ApiError(400, "Invalid type parameter. Use likes, comments, or shares.");
    }

    let matchStage = {};
    if (period !== 'all' && startDate) {
        matchStage = { createdAt: { $gte: startDate } };
    }

    // Assume likes, comments, and sharedBy are arrays.
    const field = type === 'likes' ? 'likes'
                 : type === 'comments' ? 'comments'
                 : 'sharedBy';

    const posts = await Post.aggregate([
        { $match: matchStage },
        {
            $project: {
                title: 1,
                content: 1,
                fieldCount: { $size: { $ifNull: [ `$${field}`, [] ] } },
                createdAt: 1
            }
        },
        { $sort: { fieldCount: -1 } },
        { $limit: 10 }
    ]);

    res.status(200).json(new ApiResponse(200, posts, "Top posts fetched successfully"));
});

// Get lowest performing posts based on likes, comments or shares
const getLowestPosts = asyncHandler(async (req, res) => {
    const { period, type } = req.query; // period: daily|weekly|monthly|yearly|all; type: likes|comments|shares
    let startDate = null;
    const now = new Date();

    if (period === 'daily') {
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    } else if (period === 'weekly') {
        startDate = new Date(now.setDate(now.getDate() - 7));
    } else if (period === 'monthly') {
        startDate = new Date(now.setMonth(now.getMonth() - 1));
    } else if (period === 'yearly') {
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
    } else if (period !== 'all') {
        throw new ApiError(400, "Invalid period parameter. Use daily, weekly, monthly, yearly or all.");
    }

    if (!['likes', 'comments', 'shares'].includes(type)) {
        throw new ApiError(400, "Invalid type parameter. Use likes, comments, or shares.");
    }

    let matchStage = {};
    if (period !== 'all' && startDate) {
        matchStage = { createdAt: { $gte: startDate } };
    }

    const field = type === 'likes' ? 'likes'
                 : type === 'comments' ? 'comments'
                 : 'sharedBy';

    const posts = await Post.aggregate([
        { $match: matchStage },
        {
            $project: {
                title: 1,
                content: 1,
                fieldCount: { $size: { $ifNull: [ `$${field}`, [] ] } },
                createdAt: 1
            }
        },
        { $sort: { fieldCount: 1 } }, // Ascending: lowest performing first
        { $limit: 10 }
    ]);

    res.status(200).json(new ApiResponse(200, posts, "Lowest posts fetched successfully"));
});

export {
    createPost,
    getPost,
    updatePost,
    deletePost,
    getUserPosts,
    searchPosts,
    likeorUnlikePost,
    createRePost,
    getLikedUsers,
    getRepostedUsers,
    sharePost,
    savePost,
    removeSavePost,
    getUserSavedPosts,
    getLikedPosts,
    getLowestPosts,
    getTopPosts
}