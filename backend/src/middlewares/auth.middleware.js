import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
export const verifyJWT = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    if(!decodedToken){
        throw new ApiError(401, "Invalid Access Token")
    }

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }
    // if(user.isEmailVerified === false){
    //     throw new ApiError(401, "Email is not verified")
    // }
    // console.log(user)
    req.user = user;
    next();
  } catch (error) {
    if(error instanceof jwt.TokenExpiredError){
      return res.status(403).json({message: "Token has expired"})
    }
    return res.status(401).json({ message: "Something went wrong while authenticating user" });
  }
};