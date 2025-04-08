import jwt from 'jsonwebtoken';
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary,deleteFromCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { sendEmail } from "../utils/sendMail.js";
import { Post } from '../models/post.model.js';
import Analytics from '../models/analytics.model.js';
const generateAccesAndRefreshToken = async(userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({validateBeforeSave: false});

    return {accessToken, refreshToken};
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating refresh and access token");
  }
}

const registerUser = asyncHandler(async (req, res) => {
  // Get user details from frontend(request)

  const {username, email, password} = req.body;
  
  // Validate the user details

  if([username, email, password].some((field) => field?.trim() === "")){
    throw new ApiError(400, "All fields are required");
  }
  const usernameRegex = /^[a-zA-Z_][a-zA-Z0-9_@]*$/;
  if(!usernameRegex.test(username)){
    throw new ApiError(400, "Invalid username");
  }
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if(!emailRegex.test(email)){
    throw new ApiError(400, "Invalid email");
  }
  if(password.length < 6){
    throw new ApiError(400, "Password must be at least 6 characters long");
  }

  // Check if user already exists using username and password

  const existedUser = await User.findOne({
    $or: [{username}, {email}]
  })
  if(existedUser){
    throw new ApiError(400, "User already exists, please login");
  } // redirect to login
  
  // check for profile pic and upload to cloudinary
  // console.log("req.files: ",req.files?.profilePicture[0]?.path);
  let pfpLocalPath;
  let profilePicture; 
  if(req.files && Array.isArray(req.files.profilePicture) && req.files.profilePicture.length > 0){
    pfpLocalPath = req.files.profilePicture[0].path;
  }
  // console.log("pfpfLocalPath: ", pfpfLocalPath);
  if(!pfpLocalPath){
    // // set default profile picture
    // console.log("default profile picture");
    // const defaultProfilePicture = {
    //   name: "default-profile-picture",
    //   url: process.env.DEFAULT_USER_IMAGE_URL
    // }
  }
  else{
  profilePicture = await uploadOnCloudinary(pfpLocalPath);
  if(!profilePicture){
    throw new ApiError(400, "Profile picture upload failed");
  }
}
const profilePictureURL = pfpLocalPath ? profilePicture.url : process.env.DEFAULT_USER_IMAGE_URL;

  // create user object - create entry in db
  
  const user = await User.create({
    username,
    email,
    password,
    profilePicture: profilePictureURL,
  })
  // remove password and refresh token field from response
  // check for user creation
  const createdUser = await User.findById(user._id).select("-password -refreshToken");
  if(!createdUser){
    throw new ApiError(500, "Something went wrong while registering the user");
  }
  // Return the response
  return res.status(201).json(
    new ApiResponse(200, createdUser, "User registered successfully")
  )
});

const loginUser = asyncHandler(async (req, res) =>{
  // req body -> data
  // username or email
  //find the user
  //password check
  //access and referesh token
  //send cookie

  const {email, username, password} = req.body

  if (!username && !email) {
      throw new ApiError(400, "username or email is required")
  }
  
  // Here is an alternative of above code based on logic discussed in video:
  // if (!(username || email)) {
  //     throw new ApiError(400, "username or email is required")
      
  // }

  const user = await User.findOne({
      $or: [{username}, {email}]
  })

  if (!user) {
      throw new ApiError(404, "User does not exist")
  }

 const isPasswordValid = await user.isPasswordCorrect(password)

 if (!isPasswordValid) {
  throw new ApiError(401, "Invalid user credentials")
  }
  if(user.isBlocked){
    throw new ApiError(403, "User is blocked due to posting some illegal content or having a illegitimate account")
  }
 const {accessToken, refreshToken} = await generateAccesAndRefreshToken(user._id)

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
  loggedInUser.emailVerificationToken = undefined;
  loggedInUser.emailVerificationTokenExpiry = undefined;
  loggedInUser.passwordResetToken = undefined;
  loggedInUser.passwordResetTokenExpiry = undefined;
  loggedInUser.lastLogin = undefined
  const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
  }

  return res
  .status(200)
  .cookie("accessToken", accessToken, options)
  .cookie("refreshToken", refreshToken, options)
  .json(
      new ApiResponse(
          200, 
          {
              user: loggedInUser, accessToken, refreshToken
          },
          "User logged In Successfully"
      )
  )

})


const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {refreshToken: undefined}
    },
    {
      new: true
    }
  )
  const options = {
    httpOnly: true,
    secure:  process.env.NODE_ENV === "production"
  }
  return res
  .status(200)
  .clearCookie("accessToken", options)
  .clearCookie("refreshToken", options)
  .json(new ApiResponse(200, {}, "User logged out successfully"));
})

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
  if(!incomingRefreshToken){
    throw new ApiError(401, "Unauthorized request");

  }
  try {
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id);
    if(!user){
      throw new ApiError(401, "Invalid refresh token");
    }
    if(incomingRefreshToken !== user?.refreshToken){
      throw new ApiError(401, "Refresh token is expired or used");
    }
    const {accessToken, refreshToken} = await generateAccesAndRefreshToken(user._id);
    const newRefreshToken = refreshToken;
    const options = {
      httpOnly: true,
      secure:process.env.NODE_ENV === "production"
    }
    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(
      new ApiResponse(
        200,
        {accessToken, refreshToken: newRefreshToken},
        "Access token refreshed"
      )
    )
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
})


const changeCurrentPassword = asyncHandler(async (req, res) => {
  const {oldPassword, newPassword} = req.body;
  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if(!isPasswordCorrect){
    throw new ApiError(400, "Invalid old password");
  }
  user.password = newPassword;
  await user.save({validateBeforeSave: true});
  return res
  .status(200)
  .json(new ApiResponse(200, {}, "Password changed successfully"));
})

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = req.user;
  user.password = undefined;
  user.refreshToken = undefined;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.emailVerificationToken = undefined;
  user.emailVerificationTokenExpiry = undefined;
  user.deviceTokens = undefined;
  if(user.isBlocked){
    throw new ApiError(403, "User is blocked due to posting some illegal content or having a illegitimate account")
  }
  if(!user.isEmailVerified){
    return res.status(420).redirect(`${process.env.CLIENT_URL}/send-email-verification`)
  }
  return res
  .status(200)
  .json(new ApiResponse(200, user, "User fetched successfully"));
})

const updateAccountDetails = asyncHandler(async(req,res)=>{
  const {username, email, bio} = req.body;

  if(!username && !email && !bio){
    throw new ApiError(400, "All fields are required");
  }
  if(req.user.username === username && req.user.email === email && req.user.bio === bio){
    throw new ApiError(400, "No changes detected");
  }
  let prevEmail = req.user.email;
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        username,
        email,
        bio
      }
    },
    {new: true}
  ).select("-password -refreshToken -passwordResetToken -passwordResetTokenExpiry -deviceTokens");
  let isEmailChanged = false;
  if(prevEmail !== email){
    user.isEmailVerified = false;
    await user.save({validateBeforeSave: false});
    isEmailChanged = true;
  }
  user.emailVerificationToken = undefined;
  user.emailVerificationTokenExpiry = undefined;
  return res
  .status(200)
  .json(new ApiResponse(200, {user, isEmailChanged}, "Account details updated successfully"));
})

const updateProfilePicture = asyncHandler(async(req, res)=>{
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    
  ).select("-password -refreshToken -passwordResetToken -passwordResetTokenExpiry -emailVerificationToken -emailVerificationTokenExpiry -deviceTokens");
  const oldProfilePicture = user?.profilePicture;
  const oldPublicId = oldProfilePicture?.split("/").pop().split(".")[0];
  const defaultProfilePicture = process.env.DEFAULT_USER_IMAGE_URL
  if(oldProfilePicture != defaultProfilePicture){
    const res = await deleteFromCloudinary(oldPublicId);
    if(!res){
      throw new ApiError(400, "Error while deleting old profile picture");
    }
  }

  const profilePictureLocalPath = req.file?.path;
  if(!profilePictureLocalPath){
    throw new ApiError(400, "Profile picture is required");
  }
  const profilePicture = await uploadOnCloudinary(profilePictureLocalPath);
  if(!profilePicture.url){
    throw new ApiError(400, "Error while uploading profile picture");
  }
  user.profilePicture = profilePicture.url;
  await user.save({validateBeforeSave: false});
  
  return res
  .status(200)
  .json(new ApiResponse(200, user, "Profile picture updated successfully"));
})

const getUserProfile = asyncHandler(async(req, res)=>{
  const {username} = req.params;
  if(!username?.trim()){
    throw new ApiError(400, "Username is required");
  }
  const followers =await User.findOne({username}).select("followers").populate({
    path: "followers",
    select: "username email profilePicture"
  });

  const following =await User.findOne({username}).select("following").populate({
    path: "following",
    select: "username email profilePicture"
  });
  const followersCount = followers?.followers?.length || 0;
  const followingCount = following?.following?.length || 0;
  const user = await User.findOne({username}).select("-password -refreshToken -lastLogin -preferences -emailVerificationToken -emailVerificationTokenExpiry -deviceTokens -passwordResetToken -passwordResetTokenExpiry")
  return res
  .status(200)
  .json(new ApiResponse(200, {user, followersCount, followingCount}, "User profile fetched successfully"));
  
})

const getUserFollowers = asyncHandler(async(req, res)=>{
  const {username} = req.params;
  if(!username?.trim()){
    throw new ApiError(400, "Username is required");
  }
  const user = await User.findOne({username}).select("followers").populate({
    path: "followers",
    select: "username email profilePicture bio college engineeringDomain"
  });
  const followers = user?.followers || [];
  return res
  .status(200)
  .json(new ApiResponse(200, followers, "User followers fetched successfully"));
})
const getUserFollowing = asyncHandler(async(req, res) => {
  const { username } = req.params;
  if (!username?.trim()) {
    throw new ApiError(400, "Username is required");
  }
  const user = await User.findOne({ username }).select("following").populate({
    path: "following",
    select: "username email profilePicture college engineeringDomain"
  });
  const following = user?.following || [];
  return res.status(200).json(new ApiResponse(200, following, "User following fetched successfully"));
});


const getAccountRecommendations = asyncHandler(async(req, res)=>{
  const user = await User.findById(req.user?._id);
  const followers = user?.followers || [];
  const following = user?.following || [];
  const users = await User.find({
    _id: {$nin: [req.user?._id, ...followers, ...following]}
  }).select("username email profilePicture college engineeringDomain")
  .limit(5);
  return res
  .status(200)
  .json(new ApiResponse(200, users, "Account recommendations fetched successfully"));
})

const addPersonalDetails = asyncHandler(async(req, res)=>{
    const { phone, engineeringDomain, college, yearOfGraduation } = req.body
    if(!phone && !engineeringDomain && !college && !yearOfGraduation){
        throw new ApiError(400, "Atleast one field is required");
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                phone,
                engineeringDomain,
                college,
                yearOfGraduation
            }
        },
        {new: true}
    ).select("-password -refreshToken -lastLogin -preferences -emailVerificationToken -emailVerificationTokenExpiry -deviceTokens -passwordResetToken -passwordResetTokenExpiry");
    return res
    .status(200)
    .json(new ApiResponse(200, user, "Personal details updated successfully"));
})


const followOrUnfollowUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    throw new ApiError(400, 'User ID is required');
  }

  const currentUser = await User.findById(req.user._id);
  const userToFollow = await User.findById(userId);

  if (!userToFollow) {
    throw new ApiError(404, 'User not found');
  }

  const today = new Date().toISOString().split('T')[0];
  let analytics = await Analytics.findOne({ userId: userToFollow._id, date: today });
  
  if (!analytics) {
    analytics = new Analytics({ userId: userToFollow._id });
  }


  if (currentUser.following.includes(userId)) {
    // Unfollow the user
    currentUser.following = currentUser.following.filter(
      (followingId) => followingId.toString() !== userId
    );
    userToFollow.followers = userToFollow.followers.filter(
      (followerId) => followerId.toString() !== req.user._id.toString()
    );

  analytics.unfollows += 1; 
  } else {
    // Follow the user
    currentUser.following.push(userId);
    userToFollow.followers.push(req.user._id);
    analytics.follows += 1; 
  }

  await currentUser.save({validateBeforeSave:false});
  await userToFollow.save({ validateBeforeSave: false });
  await analytics.save();

  currentUser.password = undefined
  currentUser.refreshToken = undefined
  currentUser.lastLogin = undefined
  currentUser.passwordResetToken = undefined
  currentUser.passwordResetTokenExpiry = undefined
  currentUser.emailVerificationToken = undefined
  currentUser.emailVerificationTokenExpiry = undefined
  currentUser.deviceTokens = undefined
  currentUser.loginType = undefined
  return res.status(200).json(
    new ApiResponse(200, {
      following: currentUser.following,
      followers: userToFollow.followers,
      currentUser
    }, 'Follow/Unfollow successful')
  );
});

const forgotPassword = asyncHandler(async(req, res)=>{
  const {email, username} = req.body;
  if(!email && !username){
    throw new ApiError(400, "Email or username is required");
  }
  const user = await User.findOne({
    $or: [{email}, {username}]
  });
  if(!user){
    throw new ApiError(404, "User not found");
  }
  const resetToken = await user.generatePasswordResetToken();
  user.passwordResetToken = resetToken;
  await user.save({validateBeforeSave: false});
  const resetPasswordURL = `${req.get("origin")}/reset-password/${resetToken}`;
  const message = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f4;
        color: #333333;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      }
      .header {
        font-size: 24px;
        font-weight: bold;
        text-align: center;
        margin-bottom: 20px;
      }
      .content {
        font-size: 16px;
        line-height: 1.5;
        text-align: left;
      }
      .button {
        display: inline-block;
        background-color: #4CAF50;
        color: white;
        padding: 12px 20px;
        margin-top: 20px;
        text-decoration: none;
        border-radius: 5px;
        font-weight: bold;
        text-align: center;
      }
      .footer {
        font-size: 12px;
        color: #777;
        margin-top: 30px;
        text-align: center;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">Reset Your Password</div>
      <div class="content">
        <p>Hello,</p>
        <p>We received a request to reset your password. Click the button below to set a new password:</p>
        <a href="${resetPasswordURL}" class="button">Reset Password</a>
        <p>If you didn’t request a password reset, please ignore this email. This link will expire in 24 hours.</p>
      </div>
      <div class="footer">
        <p>&copy; 2024 SocialHive. All rights reserved.</p>
      </div>
    </div>
  </body>
  </html>
  `;
  
  
  await sendEmail({
    email: user.email,
    subject: "Reset your password",
    message
  });
  return res
  .status(200)
  .json(new ApiResponse(200, {}, "Password reset token sent to your email"));
})
const resetPassword = asyncHandler(async(req, res)=>{
  const {resetToken} = req.params;
  const {password} = req.body;
  const user = await User.findOne({
    passwordResetToken: resetToken,
  });
  if(!user){
    throw new ApiError(400, "Token is invalid or expired");
  }
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  return res
  .status(200)
  .json(new ApiResponse(200, {}, "Password reset successful"));
})
const signedInResetPassword = asyncHandler(async(req, res)=>{
  const {resetToken} = req.params;
  const {password} = req.body;
  const user = await User.findOne({
    passwordResetToken: resetToken,
  });
  if(!user){
    throw new ApiError(400, "Token is invalid or expired");
  }
  if(req.user._id.toString() != user._id.toString()){
    throw new ApiError(400, "You are not authorized to reset this password");
  }
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  return res
  .status(200)
  .json(new ApiResponse(200, {}, "Password reset successful"));
})


const sendVerificationEmail = asyncHandler(async(req, res)=>{
  const user = await User.findById(req.user?._id);
  const currentTime = new Date();
  if(user.emailVerificationTokenExpiry && 
    user.emailVerificationTokenExpiry > currentTime){
      throw new ApiError(400, "Email verification token is already sent and is valid");
    }
  
  const token = user.generateEmailVerificationToken();
  user.emailVerificationToken = token;
  user.emailVerificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // Set expiry 24 hours from now
  await user.save({validateBeforeSave: false});
  const verificationURL = `${req.get("origin")}/mail-verification/${token}`;
const message = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Verification</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      color: #333333;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }
    .header {
      font-size: 24px;
      font-weight: bold;
      text-align: center;
      margin-bottom: 20px;
    }
    .content {
      font-size: 16px;
      line-height: 1.5;
      text-align: left;
    }
    .button {
      display: inline-block;
      background-color: #4CAF50;
      color: white;
      padding: 12px 20px;
      margin-top: 20px;
      text-decoration: none;
      border-radius: 5px;
      font-weight: bold;
      text-align: center;
    }
    .footer {
      font-size: 12px;
      color: #777;
      margin-top: 30px;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">Verify Your Email</div>
    <div class="content">
      <p>Hello,</p>
      <p>Thank you for signing up! Please click the button below to verify your email address:</p>
      <a href="${verificationURL}" class="button">Verify Email</a>
      <p>If you did not request this verification, you can safely ignore this email.</p>
    </div>
    <div class="footer">
      <p>&copy; 2024 SocialHive. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

  await sendEmail({
    email: user.email,
    subject: "Verify your email",
    message
  });
  return res
  .status(200)
  .json(new ApiResponse(200, {}, "Verification email sent successfully"));
})

const verifyEmail = asyncHandler(async(req, res)=>{
  const {token} = req.params;
  const decodedToken = jwt.verify(token, process.env.EMAIL_VERIFICATION_TOKEN_SECRET);
  const user = await User.findById(decodedToken?._id);
  if(!user){
    throw new ApiError(400, "Invalid token");
  }
  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationTokenExpiry = undefined;
  await user.save({validateBeforeSave: true});
  return res
  .status(200)
  .json(new ApiResponse(200, {}, "Email verified successfully"));
})


const resendVerificationEmail = asyncHandler(async(req, res)=>{
  const user = await User.findById(req.user?._id);
  if(user.isEmailVerified){
    throw new ApiError(400, "Email is already verified");
  }
  await sendVerificationEmail(req, res);
})


const getUserFeed = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?._id);
  const following = user.following;

  const limit = parseInt(req.query.limit) || 10;
  const skip = parseInt(req.query.skip) || 0;

  const feed = await Post.aggregate([
    {
      $match: {
        $and: [
          {
            $or: [
              { createdBy: { $in: following } }, // Posts by followed users
              { tags: { $in: [user.engineeringDomain, user.college] } }, // Posts matching user's domain or college
              { tags: { $in: user.preferences } } // Posts matching user's preferences
            ]
          },
          { createdAt: { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } }, // Posts from the last 48 hours
          { createdBy: { $ne: user._id } }, // Exclude user's own posts
          { likes: { $ne: user._id } } // Exclude posts liked by the user
        ]
      }
    },
    {
      $addFields: {
        isFollowedUser: { $cond: [{ $in: ["$createdBy", following] }, 1, 0] } // Mark posts by followed users
      }
    },
    {
      $sort: { isFollowedUser: -1, createdAt: -1 } // Sort followed users first, then by creation time
    },
    {
      $lookup: {
        from: 'users', // Collection where users are stored
        localField: 'createdBy', // Field in Post collection to match
        foreignField: '_id', // Field in User collection to match with
        as: 'createdBy' // Output field for user data
      }
    },
    {
      $unwind: '$createdBy' // Unwind the array so that createdBy is a single object
    },
    {
      $lookup: {
        from: 'posts', // Collection for reposts
        localField: 'repostedFrom', // Field to match for reposted content
        foreignField: '_id', // Match with the original post
        as: 'repostedPost' // Output field for reposted post data
      }
    },
    {
      $unwind: {
        path: '$repostedPost',
        preserveNullAndEmptyArrays: true // In case it's not a repost
      }
    },
    // Lookup the creator of the repostedPost
    {
      $lookup: {
        from: 'users', // Collection where users are stored
        localField: 'repostedPost.createdBy', // Field in repostedPost to match
        foreignField: '_id', // Field in User collection to match
        as: 'repostedPost.createdBy' // Output field for original user data
      }
    },
    {
      $unwind: {
        path: '$repostedPost.createdBy', // Unwind original post creator data
        preserveNullAndEmptyArrays: true // In case it's not a repost
      }
    },
    {
      $project: {
        // Select the fields you want to include
        createdBy: { _id: 1, username: 1, email: 1, profilePicture: 1 }, // User details for original post
        tags: 1,
        createdAt: 1,
        isFollowedUser: 1,
        title: { $cond: { if: "$isRepost", then: "$repostedPost.title", else: "$title" } }, // Use reposted title if applicable
        content: { $cond: { if: "$isRepost", then: "$repostedPost.content", else: "$content" } }, // Use reposted content if applicable
        likes: 1,
        comments: 1,
        public: 1,
        repostedFrom: 1, // Show repostedFrom field
        repostedPost: {
          _id: 1,
          title: 1,
          content: 1,
          media: 1,
          createdBy: { _id: 1, username: 1, profilePicture: 1 }, // Show original post's creator
          createdAt: 1,
          likes: 1,
          comments: 1,
          repostedBy: 1
        },
        isRepost: 1, // Indicate if it's a repost
        repostedBy: 1,
        media: 1, // Include media field
        sharedBy: 1,
        savedBy: 1
      }
    },
    {
      $skip: skip
    },
    {
      $limit: limit
    }
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, feed, "User feed fetched successfully"));
});


const searchUsers = asyncHandler(async(req, res)=>{
  const {query} = req.query;
  if(!query){
    throw new ApiError(400, "Query is required");
  }
  const users = await User.find({
    $or: [
      {username: {$regex: query, $options: 'i'}},
      {email: {$regex: query, $options: 'i'}}
    ]
  }).select("username email profilePicture");
  return res
  .status(200)
  .json(new ApiResponse(200, users, "Users fetched successfully"));
})

const handleSocialLogin = asyncHandler(async(req, res)=>{
 const user = await User.findById(req.user?._id);
 if(!user){
  throw new ApiError(404, "User not found");
 }
 const {accessToken, refreshToken} = await generateAccesAndRefreshToken(user._id);
 const options = {
   httpOnly: true,
   secure:process.env.NODE_ENV === "production"
 }
 return res
 .status(201)
 .cookie("accessToken", accessToken, options)
 .cookie("refreshToken", refreshToken, options)
 .redirect(`${process.env.CLIENT_URL}/setLogin?access-token=${accessToken}&refresh-token=${refreshToken}`);

}
)

const isUsernameUnique = asyncHandler(async(req,res)=>{
  const {username} = req.query
  const user = await User.findOne({username});
  if(user){
    return res.status(200).json(new ApiResponse(200, {isUnique: false}, "Username already exists"))
  }
  res.status(200).json(new ApiResponse(200, {isUnique:true}, "Username is unique"));
})

const checkToken = asyncHandler(async(req, res)=>{
  const user = await User.findById(req.user?._id);
  if(!user){
    throw new ApiError(404, "User not found");
  }
  if(user.isBlocked){
    throw new ApiError(402, "User is blocked");
  }
  if(user.isEmailVerified == false){
    throw new ApiError(420, "Email is not verified");
  }
  return res
  .status(200)
  .json(new ApiResponse(200, {}, "Token is valid"));
})

export { registerUser,signedInResetPassword, loginUser, logoutUser, refreshAccessToken, changeCurrentPassword,
  getAccountRecommendations, getCurrentUser, updateAccountDetails, updateProfilePicture, getUserProfile, 
  addPersonalDetails , followOrUnfollowUser, forgotPassword, resetPassword, searchUsers, sendVerificationEmail, 
  verifyEmail, resendVerificationEmail, getUserFeed, getUserFollowers, getUserFollowing, handleSocialLogin, 
  isUsernameUnique, checkToken};