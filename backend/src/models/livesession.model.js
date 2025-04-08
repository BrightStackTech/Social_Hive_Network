import mongoose from "mongoose";

const liveSessionSchema = new mongoose.Schema(
  {
    meetingId: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      default: "Untitled session",
    },
    participants: [
      {
        type: mongoose.Types.ObjectId,
        ref: "User",
      },
    ],
    recordings: {
      type: [String],
      default: [],
    },
    terminatedAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      default: "ongoing",  // or "ongoing"
    },
  },
  { timestamps: true }
);

export const LiveSession = mongoose.model("LiveSession", liveSessionSchema);