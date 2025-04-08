import Analytics from '../models/analytics.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

const getAnalytics = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { period } = req.query; // weekly, monthly, yearly

  const now = new Date();
  let startDate;

  if (period === 'weekly') {
    startDate = new Date(now.setDate(now.getDate() - 7));
  } else if (period === 'monthly') {
    startDate = new Date(now.setMonth(now.getMonth() - 1));
  } else if (period === 'yearly') {
    startDate = new Date(now.setFullYear(now.getFullYear() - 1));
  } else {
    throw new ApiError(400, 'Invalid period');
  }

  const analytics = await Analytics.find({
    userId,
    date: { $gte: startDate },
  });

  res.status(200).json(analytics);
});

export { getAnalytics };