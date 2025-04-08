import {Socket, Server} from 'socket.io'
import { AvailableChatEvents, ChatEventEnum } from '../constants.js'
import {User} from '../models/user.model.js'
import {ApiError} from '../utils/ApiError.js'
import cookie from 'cookie'
import jwt from 'jsonwebtoken'

const mountJoinChatEvent = (socket)=>{
    socket.on(ChatEventEnum.JOIN_CHAT_EVENT, (chatRoomId)=>{
        socket.join(chatRoomId)
        console.log(`User joined chat room ${chatRoomId}`)
    })
}

//Mount typing event in future
//Mount stop typing event in future

// backend/src/socket/index.js

const initializeSocketIO = (io) => {
  return io.on("connection", async (socket) => {
    try {
      const cookies = cookie.parse(socket.handshake.headers.cookie || "");
      let token = socket.handshake.auth.token;

      if (!token) {
        token = cookies.accessToken;
      }

      if (!token) {
        throw new ApiError(401, "Token is not passed in socket connection");
      }

      const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      if (!decodedToken) {
        throw new ApiError(401, "Invalid access token");
      }

      const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
      if (!user) throw new ApiError(401, "Invalid access token");

      socket.user = user;
      socket.join(user._id.toString());
      socket.emit(ChatEventEnum.CONNECTED_EVENT);
      io.emit('userOnline', user._id.toString()); // Emit userOnline event

      console.log("User connected: UserID", user._id.toString());
      mountJoinChatEvent(socket);

      socket.on(ChatEventEnum.DISCONNECT_EVENT, () => {
        console.log("User disconnected: UserID", socket.user._id.toString());
        if (socket.user) {
          socket.leave(user._id.toString());
          io.emit('userOffline', socket.user._id.toString()); // Emit userOffline event
        }
      });
    } catch (error) {
      socket.emit("error", error.message);
    }
  });
};

const emitSocketEvent = (req, roomId, event, data)=>{
    req.app.get("io").in(roomId).emit(event, data)
}
export {initializeSocketIO, emitSocketEvent}