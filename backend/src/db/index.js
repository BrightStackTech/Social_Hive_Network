import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import logger from "../logger/winston.logger.js";
const connectDB = async()=>{
    try {
        const db = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        db.connection.on("connected",()=>{
            logger.info(`MongoDB connected with host ${db.connection.host}`);
        })
        db.connection.on("error",(error)=>{

            logger.error(`MongoDB connection failed with error: ${error}`);
            process.exit(1);
        })
        db.connection.on("disconnected",()=>{
            logger.error("MongoDB disconnected");
        })
        logger.info(`MongoDB connected with host ${db.connection.host}`);
    } catch (error) {
        console.log("MongoDB connection failed",error);
        process.exit(1);
    }
}

export default connectDB;