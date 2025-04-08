import cron from 'node-cron';
import { Update } from './models/updates.model.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Schedule a job to run every hour
cron.schedule('0 * * * *', async () => {
  try {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Find and delete updates older than 24 hours
    const result = await Update.deleteMany({ createdAt: { $lt: twentyFourHoursAgo } });
    console.log(`Deleted ${result.deletedCount} updates older than 24 hours.`);
  } catch (error) {
    console.error('Error deleting old updates:', error);
  }
});