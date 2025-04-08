import mongoose from "mongoose";
import { ChatMessage } from "../models/message.model.js";
// import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AvailableChatEvents, ChatEventEnum } from "../constants.js";
import { emitSocketEvent } from "../socket/index.js";
import { Chat } from "../models/chat.model.js";
import axios from "axios";
const chatMessageCommonAggregation = () => {
    return [
      {
        $lookup: {
          from: "users",
          foreignField: "_id",
          localField: "sender",
          as: "sender",
          pipeline: [
            {
              $project: {
                _id: 1,
                username: {
                  $cond: {
                    if: { $eq: ["$_id", new mongoose.Types.ObjectId("67b88e66815a779177736fe2")] },
                    then: "hiveai",
                    else: "$username"
                  }
                },
                profilePicture: {
                  $cond: {
                    if: { $eq: ["$_id", new mongoose.Types.ObjectId("67b88e66815a779177736fe2")] },
                    then: `http://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/v1740148380/kf1x4td7dzpsqegmbosd.jpg`, // update with your desired URL
                    else: "$profilePicture"
                  }
                },
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
    ];
};

const getChatMessages = asyncHandler(async (req, res) => {
    const { chatId } = req.params;
    if(!chatId){
        throw new ApiError(400, "Chat id is required");
    }
    const chat = await Chat.findById(chatId);
    if(!chat){
        throw new ApiError(404, "Chat not found");
    }
    if(!chat.participants.includes(req.user._id)){
        throw new ApiError(403, "You are not authorized to access this chat");
    }
    const chatMessages = await ChatMessage.aggregate([
      {
        $match: {
          chat: new mongoose.Types.ObjectId(chatId),
        },
      },
      ...chatMessageCommonAggregation(),
      {
        $sort: {
          createdAt:1
        },
      }
    ]);
    if (!chatMessages.length) {
      throw new ApiError(402, "No chat messages found");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, chatMessages, "Chat messages fetched successfully"));
});


const stripHtmlTags = (html) => {
    return html.replace(/<[^>]*>/g, '');
};

const sendMessage = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const { content } = req.body;
  // Remove HTML tags then trim
  const sanitizedContent = stripHtmlTags(content).trim();
  console.log("Sanitized message content:", sanitizedContent);
  
  if (!chatId) {
    throw new ApiError(400, "Chat id is required");
  }
  if (!sanitizedContent) {
    throw new ApiError(400, "Message content is required");
  }

  // If message begins with '@hiveai', call the external API to get a response
  if (sanitizedContent.startsWith("@hiveai")) {
    // Extract the prompt (all text after "@hiveai")
    const prompt = sanitizedContent.substring("@hiveai".length).trim();
    const payload = {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    };
    let promptRes = "";
    try {
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GOOGLE_GEMINI_API_KEY}`;
      console.log("Sending POST request to AI API:", apiUrl);
      console.log("Payload:", JSON.stringify(payload));
      const apiResponse = await axios.post(apiUrl, payload);
      console.log("AI API response:", apiResponse.data);
      promptRes = apiResponse.data.candidates[0].content.parts[0].text;
      console.log("Extracted bot response:", promptRes);
    } catch (error) {
      console.error("Error calling AI API:", error);
      throw new ApiError(500, "Error generating AI response");
    }

    // Create the original sender message
    const senderMessage = await ChatMessage.create({
      sender: req.user._id,
      chat: chatId,
      content: content
    });

    const botUserId = new mongoose.Types.ObjectId("67b88e66815a779177736fe2");
    const botMessage = await ChatMessage.create({
      sender: botUserId,
      chat: chatId,
      content: promptRes
    });

    const populatedSenderMessage = await ChatMessage.findById(senderMessage._id)
      .populate({
        path: 'sender',
        select: 'username profilePicture email'
      });
    const populatedBotMessage = await ChatMessage.findById(botMessage._id)
      .populate({
        path: 'sender',
        select: 'username profilePicture email'
      });

    console.log("Sending bot message:", populatedBotMessage);

    // Emit socket events using the populated messages
    const chat = await Chat.findById(chatId);
    chat.participants.forEach((participant) => {
      emitSocketEvent(
        req,
        participant.toString(),
        ChatEventEnum.MESSAGE_RECEIVED_EVENT,
        populatedSenderMessage
      );
      emitSocketEvent(
        req,
        participant.toString(),
        ChatEventEnum.MESSAGE_RECEIVED_EVENT,
        populatedBotMessage
      );
    });

    return res.status(201).json(new ApiResponse(201, { senderMessage: populatedSenderMessage, botMessage: populatedBotMessage }, "Message sent with AI response"));
  }

  // Else, process a normal message
  const chatMessage = await ChatMessage.create({
    sender: req.user._id,
    chat: chatId,
    content
  });
  const chat = await Chat.findByIdAndUpdate(
    chatId,
    { lastMessage: chatMessage._id },
    { new: true }
  );
  const chatMessages = await ChatMessage.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(chatMessage._id)
      }
    },
    ...chatMessageCommonAggregation(),
  ]);
  if (!chatMessages.length) {
    throw new ApiError(404, "No chat messages found");
  }
  const receivedMessage = chatMessages[0];
  chat.participants.forEach((participant) => {
    if (participant._id.toString() !== req.user._id.toString()) {
      emitSocketEvent(
        req,
        participant._id?.toString(),
        ChatEventEnum.MESSAGE_RECEIVED_EVENT,
        receivedMessage
      );
    }
  });
  return res.status(201).json(new ApiResponse(201, receivedMessage, "Message sent successfully"));
});

const deleteMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  if (!messageId) {
    throw new ApiError(400, "Message id is required");
  }
  const message = await ChatMessage.findById(messageId);
  if (!message) {
    throw new ApiError(404, "Message not found");
  }
  // Allow deletion if the current user is the sender OR the message is from the bot
  if (!(message.sender.toString() === req.user._id.toString() || message.sender.toString() === "67b88e66815a779177736fe2")) {
    throw new ApiError(403, "You are not authorized to delete this message");
  }
  const deletedMessage = await ChatMessage.findByIdAndDelete(messageId);
  const chat = await Chat.findById(deletedMessage.chat);
  if (chat.lastMessage.toString() == deletedMessage._id.toString()) {
    const lastMessage = await ChatMessage.find({ chat: chat._id }).sort({ createdAt: -1 });
    chat.lastMessage = lastMessage[0]._id;
    await chat.save();
  }
  chat.participants.forEach((participant) => {
    if (participant._id.toString() !== req.user._id.toString()) {
      emitSocketEvent(
        req,
        participant._id?.toString(),
        ChatEventEnum.MESSAGE_DELETE_EVENT,
        deletedMessage
      );
    }
  });
  return res.status(200).json(new ApiResponse(200, deletedMessage, "Message deleted successfully"));
});

export {sendMessage, getChatMessages, deleteMessage};