import { ChatEventEnum, AvailableChatEvents } from "../constants.js";
import { emitSocketEvent } from "../socket/index.js";
import { Chat } from '../models/chat.model.js'
import {Group} from '../models/group.model.js'
import { User } from '../models/user.model.js'
import { ChatMessage } from '../models/message.model.js'
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";


const chatCommonAggregation = () => {
    return [
        {
            // lookup for the participants present
            $lookup: {
                from: "users",
                foreignField: "_id",
                localField: "participants",
                as: "participants",
                pipeline: [
                    {
                        $project: {
                            password: 0,
                            refreshToken: 0,
                            passwordResetToken: 0,
                            passwordResetTokenExpiry: 0,
                            emailVerificationToken: 0,
                            emailVerificationExpiry: 0,

                            deviceTokens: 0,
                            posts: 0,
                            preferences: 0,
                            isEmailVarified: 0,
                            loginType: 0,
                            followers: 0,
                            following: 0,
                            joinDate: 0,
                            lastLogin: 0,
                            pendingGroupRequests: 0,
                        },
                    },
                ],
            },
        }, {
            $lookup: {
                from: "chatmessages",
                localField: "lastMessage",
                foreignField: "_id",
                as: "lastMessageDetails",
                pipeline: [
                    {
                        // get details of the sender
                        $lookup: {
                            from: "users",
                            foreignField: "_id",
                            localField: "sender",
                            as: "sender",
                            pipeline: [
                                {
                                    $project: {
                                        username: 1,
                                        avatar: 1,
                                        email: 1,
                                    },
                                },
                            ],
                        },
                    },
                    {
                        $addFields: {
                            sender: { $first: "$sender" },
                        },
                    },
                ],
            }
        }, 
       
    ];
};

const getChats = asyncHandler(async (req, res) => {
    const chats = await Chat.aggregate([
        {
            $match: {
                participants: {
                    $elemMatch: {
                        $eq: req.user._id
                    }
                }
            }
        },
        ...chatCommonAggregation()
    ])
    return res.status(200).json(new ApiResponse(200, chats, "Chats fetched successfully"))
})


const createOrGetOnetoOneChat = asyncHandler(async (req, res) => {
    const { receiverId } = req.body
    if (!receiverId) {
        throw new ApiError(400, "receiverId is required")
    }
    if (receiverId === req.user._id) {
        throw new ApiError(400, "You can't send message to yourself")
    }
    const isChatExist = await Chat.aggregate([
        {
            $match: {
                isGroupChat: false,
                $and: [
                    {
                        participants: {
                            $elemMatch: {
                                $eq: req.user._id
                            }
                        }
                    },
                    {
                        participants: {
                            $elemMatch: {
                                $eq: new mongoose.Types.ObjectId(receiverId)
                            }
                        }
                    }
                ]
            }
        },
        ...chatCommonAggregation()
    ])
    if (isChatExist.length) {
        console.log("Chat already exist", isChatExist[0].lastMessageDetails)
        // emitSocketEvent(req, receiverId, ChatEventEnum.NEW_CHAT_EVENT, isChatExist[0])
        return res.status(200).json(new ApiResponse(200, isChatExist[0], "Chat found successfully"))
    }
    const newChat = await Chat.create({
        participants: [req.user._id, receiverId],
        admin: req.user._id
    })
    const createdChat = await Chat.aggregate([
        {
            $match: {
                _id: newChat._id
            }
        },
        ...chatCommonAggregation()
    ])
    const data = createdChat[0];
    emitSocketEvent(req, receiverId, ChatEventEnum.NEW_CHAT_EVENT, data)
    return res.status(201).json(new ApiResponse(200, data, "Chat created successfully"))
})

const deleteChat = asyncHandler(async (req, res) => {
    const { chatId } = req.params
    if (!chatId) {
        throw new ApiError(400, "Chat id is required")
    }
    const chat = await Chat.findById(chatId)
    if (!chat) {
        throw new ApiError(404, "Chat not found")
    }
    const deletedChat = await Chat.findByIdAndDelete(chatId)
    await ChatMessage.deleteMany({ chat: chatId })
    deletedChat.participants.forEach((participant) => {
        if (participant._id.toString() !== req.user._id.toString()) {
            emitSocketEvent(req, participant._id.toString(), ChatEventEnum.LEAVE_CHAT_EVENT, deletedChat)
        }
    })
    return res.status(200).json(new ApiResponse(200, deletedChat, "Chat deleted successfully"))
})

const createGroupChat = asyncHandler(async (req, res) => {
    const { groupId } = req.body
    if (!groupId) {
        throw new ApiError(400, "Group Id is required")
    }
    const group = await Group.findById(groupId)
    if (!group) {
        throw new ApiError(404, "Group not found")
    }
    const members = group.members
    const newChat = await Chat.create({
        admin: group.admin,
        isGroupChat: true,
        chatType: "group",
        name: group.name,
        participants:members,
        group:groupId
        

    })
    const createdChat = await Chat.aggregate([
        {
            $match: {
                _id: newChat._id
            }
        },
        ...chatCommonAggregation()
    ])
    return res.status(201).json(new ApiResponse(200, createdChat[0], "Group chat created successfully"))
})

const sendMessageToFollower = asyncHandler(async (req, res) => {
  const { username, text, title, description, url } = req.query;
  const senderId = req.user._id;

  if (!username || !text || !title || !description || !url) {
    throw new ApiError(400, "Missing required query parameters");
  }

  const receiver = await User.findOne({ username });
  if (!receiver) {
    throw new ApiError(404, "User not found");
  }

  const chat = await Chat.findOneAndUpdate(
    {
      isGroupChat: false,
      participants: { $all: [senderId, receiver._id] }
    },
    {
      $setOnInsert: {
        participants: [senderId, receiver._id],
        admin: senderId
      }
    },
    { new: true, upsert: true }
  );

  const truncatedDescription = description.length > 50 ? description.slice(0, 50) + '...' : description;
  const messageContent = `${text}<br/><strong style="font-size: 1.2em;">${title}</strong><br/><em style="color: #D1D5DB;">${truncatedDescription}</em><br/>${url}`;
  const message = await ChatMessage.create({
    chat: chat._id,
    sender: senderId,
    content: messageContent
  });

  chat.lastMessage = message._id;
  await chat.save();

  emitSocketEvent(req, receiver._id, ChatEventEnum.NEW_MESSAGE, message);

  return res.status(200).json(new ApiResponse(200, message, "Message sent successfully"));
});

const sendMessageToGroup = asyncHandler(async (req, res) => {
  const { groupName, text, title, description, url } = req.body;
  const senderId = req.user._id;

  if (!groupName || !text || !title || !description || !url) {
    throw new ApiError(400, "Missing required body parameters");
  }

  const group = await Group.findOne({ name: groupName });
  if (!group) {
    throw new ApiError(404, "Group not found");
  }

  const chat = await Chat.findOne({ group: group._id });
  if (!chat) {
    throw new ApiError(404, "Group chat not found");
  }

  const truncatedDescription = description.length > 50 ? description.slice(0, 50) + '...' : description;
  const messageContent = `${text}<br/><strong style="font-size: 1.2em;">${title}</strong><br/><em style="color: #D1D5DB;">${truncatedDescription}</em><br/>${url}`;
  const message = await ChatMessage.create({
    chat: chat._id,
    sender: senderId,
    content: messageContent
  });

  chat.lastMessage = message._id;
  await chat.save();

  group.members.forEach(member => {
    if (member.toString() !== senderId.toString()) {
      emitSocketEvent(req, member.toString(), ChatEventEnum.NEW_MESSAGE, message);
    }
  });

  return res.status(200).json(new ApiResponse(200, message, "Message sent successfully"));
});

export {
  getChats,
  createOrGetOnetoOneChat,
  deleteChat,
  createGroupChat,
  sendMessageToFollower,
  sendMessageToGroup,
};