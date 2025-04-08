import { Router } from "express";
import { registerUser,loginUser, logoutUser, refreshAccessToken,signedInResetPassword, changeCurrentPassword, getCurrentUser, updateProfilePicture, getUserProfile, addPersonalDetails, followOrUnfollowUser, forgotPassword,resetPassword, searchUsers, getUserFeed, getUserFollowers, getUserFollowing,handleSocialLogin,isUsernameUnique,updateAccountDetails,checkToken ,getAccountRecommendations,verifyEmail, sendVerificationEmail} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { sendEmail } from "../utils/sendMail.js";
import passport from "passport";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

try {
    passport.serializeUser((user, next) => {
        next(null, user.id)
    })
    passport.deserializeUser(async (id, next) => {
       try {
        const user = await User.findById(id)
        if(user) next(null, user)
        else next(new ApiError(404, "User not found"), null)
       } catch (error) {
        next(
            new ApiError(500, "Internal server error while deserializing the user", error.message), null
        )      
       }
    })
  
  
  passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL
        },
        async (_, __, profile, next) => {
                const user = await User.findOne({email:profile._json.email})
                if(user) {
                    if(user.loginType !== "google") {
                        return next(new ApiError(400, "User already exists with another login type"), null)
                    }
                    return next(null, user)
                }
                else{
                const newUser = await User.create({
                    username: profile._json.email?.split("@")[0],
                    email: profile._json.email,
                    password:profile._json.sub,
                    profilePicture: profile._json.picture,
                    loginType: "google",
                    isEmailVerified: true
                })
                if(newUser) return next(null, newUser)
                else return next(new ApiError(500, "Internal server error while creating the user"), null)
            
            }
        }
    )
  )
  } catch (error) {
    console.log("Error while serializing and deserializing the user", error.message);
    throw new ApiError(500, "Internal server error while serializing and deserializing the user", error.message)
  }

const router = Router()

router.route('/register').post(upload.fields([{
    name: "profilePicture",
    maxCount: 1
}])
    ,registerUser)

router.route('/loginuser').post(loginUser)
router.route('/logout').post(verifyJWT, logoutUser)
router.route('/refresh-token').post(refreshAccessToken)
router.route('/change-password').post(verifyJWT, changeCurrentPassword)
router.route('/current-user').get(verifyJWT, getCurrentUser)
router.route('/update-profile-picture').patch(verifyJWT, upload.single("profilePicture"), updateProfilePicture)
router.route('/update-account-details').patch(verifyJWT, updateAccountDetails)
router.route('/u=:username').get(getUserProfile)
router.route('/add-personal-details').post(verifyJWT, addPersonalDetails)
router.route('/follow/:userId').post(verifyJWT, followOrUnfollowUser)
router.route('/forgot-password').post(forgotPassword)
router.route('/reset-password/:resetToken').post(resetPassword)
router.route('/signed-in-reset-password/:resetToken').post(verifyJWT,signedInResetPassword)
router.route('/search').get(searchUsers)
router.route('/feed').get(verifyJWT, getUserFeed)
router.route('/check-username').get(isUsernameUnique)
router.route('/followers/:username').get(verifyJWT, getUserFollowers)
router.route('/following/:username').get(verifyJWT, getUserFollowing)
router.route('/check-token').get(verifyJWT,checkToken)
router.route('/recommendations').get(verifyJWT, getAccountRecommendations)
router.route('/send-verification-email').post(verifyJWT,sendVerificationEmail)
router.route('/verify-email/:token').post(verifyJWT,verifyEmail)

//SSO routes
router.route('/login/google').get(passport.authenticate("google", { scope: ['profile', 'email'] }), (req,res)=>{
    res.send("redirecting to google")
})
 
router.route('/google/callback').get(passport.authenticate('google', { failureRedirect: '/login' }), handleSocialLogin)
export default router