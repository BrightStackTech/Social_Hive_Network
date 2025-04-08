import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: function () {
      return !this.isRepost; // Title is required if it's not a repost
    },
  },
  content: {
    type: String,
    required: function () {
      return !this.isRepost; // Content is required if it's not a repost
    },
  },
  media: [{
    type: String,
    required: false,
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: function () { return !this.isRepost; }, // Original creator of the post
  },
  repostedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the users who reposted the post
  }],
    // New field: sharedBy will store the IDs of the users who shared the post
  sharedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: [],
    },
  ],
  // New field: savedBy will store the IDs of the users who saved/bookmarked the post
  savedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: [],
    },
  ],
  createdOn: {
    type: Date,
    default: Date.now,
  },
  modifiedOn: {
    type: Date,
    default: Date.now,
  },
  tags: [
    {
      type: String,
    },
  ],
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  public: {
    type: Boolean,
    default: true,
  },
  onlyFollowers: {
    type: Boolean,
    default: false,
  },
  isRepost: {
    type: Boolean,
    default: false,
  },
  repostedFrom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post", // Reference to the original post
    required: function () {
      return this.isRepost; // repostedFrom is required if it's a repost
    },
    validate: {
      validator: async function(value) {
        const originalPost = await mongoose.model('Post').findById(value);
        return !originalPost.isRepost; // Ensure that only original posts are reposted
      },
      message: "Only original posts can be reposted."
    }
  },

}, {
  timestamps: true,
});

export const Post = mongoose.model("Post", postSchema);
