import { v2 as cloudinary} from "cloudinary";
import fs from "fs"
import dotenv from "dotenv"
dotenv.config()
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // console.log("File uploaded successfully on cloudinary", response.url);
        fs.unlinkSync(localFilePath)
        return response
    } catch (error) {
        fs.unlinkSync(localFilePath)
        return null
    }
}
const deleteFromCloudinary = async (publicId) => {
    try {
        if(!publicId) return null
        const response = await cloudinary.uploader.destroy(publicId)
        return response
    } catch (error) {
        return null
    }
}
export {uploadOnCloudinary, deleteFromCloudinary}