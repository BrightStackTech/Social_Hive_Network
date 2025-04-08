import mongoose, { Schema } from "mongoose";

const chatSchema = new Schema(
  {
    name:{
      type:String,
      required:function(){
        return this.chatType==="group"
      }
    },
    chatType:{
      type:String,
      enum:["one2one","group"],
      default:"one2one"
    },
    isGroupChat: {
      type: Boolean,
      default: false,
    },
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "ChatMessage",
    },
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    admin: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    group:{
      type: Schema.Types.ObjectId,
      ref: "Group",
      required:function(){
        return this.chatType==="group"
      }
    }
  },
  { timestamps: true }
);

export const Chat = mongoose.model("Chat", chatSchema);
