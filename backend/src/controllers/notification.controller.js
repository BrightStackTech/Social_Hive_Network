import firebase from 'firebase-admin'
// import serviceAccount from './serviceAccountKey.json' with {type:'json'} //TODO:Encrypt this
import {asyncHandler} from '../utils/asyncHandler.js'

const serviceAccount = {
  "type": "service_account",
  "project_id": "Social_Hive_Network",
  "private_key_id": process.env.FIREBASE_PRIVATE_KEY_ID,
  "private_key": process.env.FIREBASE_PRIVATE_KEY,
  "client_email": process.env.FIREBASE_CLIENT_EMAIL,
  "client_id": process.env.FIREBASE_CLIENT_ID,
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-ipt7s%40Social_Hive_Network.iam.gserviceaccount.com"

}
firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
})
import {User} from '../models/user.model.js'
const sendNotification = asyncHandler(async (req, res) => {
  const { title, body } = req.body
  const user = req.user
  const message = {
    notification: {
      title: title,
      body: body,
    },
    tokens: user.deviceTokens,
  }
  await firebase.messaging().sendEachForMulticast(message)
  res.status(200).json({ message: 'Notification sent successfully' })
})

const sendNotificationToTopic = asyncHandler(async (req, res) => {
  const { title, body, topic } = req.body
  const message = {
    notification: {
      title: title,
      body: body,
    },
    topic: topic,
  }
  await firebase.messaging().send(message)
  res.status(200).json({ message: 'Notification sent successfully' })
})

const sendNotificationToUser = asyncHandler(async (req, res) => {
  const { title, body, userId } = req.body
  const user = await User.findById(userId)
  const message = {
    notification: {
      title: title,
      body: body,
    },
    tokens: user.deviceTokens,
  }
  await firebase.messaging().sendEachForMulticast(message)
  res.status(200).json({ message: 'Notification sent successfully' })
})



const storeDeviceToken = asyncHandler(async (req, res) => {
  const { token } = req.body
  const user = req.user
  user.deviceTokens.push(token)
  await user.save({validateBeforeSave:false})
  const message = {
    notification: {
      title: "Welcome",
      body: "Thank you, for enabling the notifications for our app",
    },
    tokens: user.deviceTokens,
  }
  await firebase.messaging().sendEachForMulticast(message)
  res.status(200).json({ message: 'Device token stored successfully' })
})
export { sendNotification,storeDeviceToken,sendNotificationToTopic,sendNotificationToUser }
