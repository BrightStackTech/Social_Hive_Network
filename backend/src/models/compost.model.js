import mongoose, { Schema } from "mongoose";
import uniqueValidator from "mongoose-unique-validator";

const comreplySchema = new Schema({
  repliedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  replyBody: {
    type: String,
    trim: true,
  },
  upvotedBy: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  downvotedBy: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  pointsCount: {
    type: Number,
    default: 0,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  comment :
    {
      type: Schema.Types.ObjectId,
      ref: 'ComComment',
    },
  isEdited: {
    type: Boolean,
    default: false,
  },
});

const comcommentSchema = new Schema({
  commentedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  commentBody: {
    type: String,
    trim: true,
  },
  replies: [
    {
      type: Schema.Types.ObjectId,
      ref: 'ComReply',
    },
  ],
  upvotedBy: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  downvotedBy: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  pointsCount: {
    type: Number,
    default: 0,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  post:{
      type: Schema.Types.ObjectId,
      ref: 'ComPost',
  },
  community: {
    type: Schema.Types.ObjectId,
    ref: 'Community',
  },
  isEdited: {
    type: Boolean,
    default: false,
  },
});

const compostSchema = new Schema({
  title: {
    type: String,
    required: true,
    maxlength: 100,
    trim: true,
  },
  description: {  // Renamed from textSubmission to description
    type: String,
    trim: true,
  },
  linkSubmission: {
    type: String,
    trim: true,
  },
  imageSubmission: {
    imageLink: {
      type: String,
      trim: true,
    },
    imageId: {
      type: String,
      trim: true,
    },
  },
  community: {
    type: Schema.Types.ObjectId,
    ref: 'Community',
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  upvotedBy: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  downvotedBy: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  pointsCount: {
    type: Number,
    default: 0,
  },
  voteRatio: {
    type: Number,
    default: 0,
  },
  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: 'ComComment',
    },
  ],
  commentCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  media: [{
    type: String,
    required: false,
  }],
  isEdited: {
    type: Boolean,
    default: false,
  },
});
const ComPost =  mongoose.model('ComPost', compostSchema);
const ComComment = mongoose.model('ComComment', comcommentSchema);
const ComReply = mongoose.model('ComReply', comreplySchema);

// replaces _id with id, convert id to string from ObjectID and deletes __v
export { ComPost, ComComment, ComReply };