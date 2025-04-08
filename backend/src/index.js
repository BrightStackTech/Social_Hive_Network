import express from "express";
import connectDB from "./db/index.js";
import dotenv from "dotenv";
import { httpServer } from "./app.js";
import logger from "./logger/winston.logger.js";
dotenv.config({
    path: "./.env"
})

connectDB()
.then(
    ()=>{
        httpServer.listen(process.env.PORT || 8000, ()=>{
            
            logger.info(`Server is running on port ${process.env.PORT}`);
        })
    }
)
.catch(
    (err) => {
        logger.error(`MongoDB connection failed: ${err}`);
    }
)