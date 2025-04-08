import { Update } from '../models/updates.model.js';
import { User } from '../models/user.model.js';

const createUpdate = async (req, res) => {
  try {
    const { media, description, postedBy } = req.body;
    const newUpdate = new Update({ media, description, postedBy });
    await newUpdate.save();
    res.status(201).json(newUpdate);
  } catch (error) {
    console.error('Error creating update:', error);
    res.status(500).json({ error: 'Failed to create update' });
  }
};

const getUpdates = async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = await Update.find({ postedBy: userId }).populate('postedBy', 'username profilePicture');
    res.status(200).json(updates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get updates' });
  }
};

const deleteUpdateById = async (req, res) => {
  try {
    const { updateId } = req.params;
    const update = await Update.findByIdAndDelete(updateId);
    if (!update) {
      return res.status(404).json({ error: 'Update not found' });
    }
    res.status(200).json({ message: 'Update deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete update' });
  }
};

const incrementViewCount = async (req, res) => {
  try {
    const { updateId } = req.params;
    const { viewerId } = req.body;

    const update = await Update.findById(updateId);
    if (!update) {
      return res.status(404).json({ error: 'Update not found' });
    }

    if (update.postedBy.toString() !== viewerId && !update.viewedBy.includes(viewerId)) {
      update.viewedBy.push(viewerId);
      update.viewCount += 1;
      await update.save();
    }

    res.status(200).json({ message: 'View count incremented successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to increment view count' });
  }
};

const getViewers = async (req, res) => {
  try {
    const { updateId } = req.params;
    const update = await Update.findById(updateId).populate('viewedBy', 'username profilePicture bio');
    if (!update) {
      return res.status(404).json({ error: 'Update not found' });
    }
    res.status(200).json(update.viewedBy);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get viewers' });
  }
};

// const getFollowedUsersWithUpdates = async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const user = await User.findById(userId).populate('following', 'username profilePicture');

//     if (!user) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     const followedUsers = user.following.map(followedUser => followedUser._id);
//     const updates = await Update.find({ postedBy: { $in: followedUsers } }).populate('postedBy', 'username profilePicture');

//     const usersWithUpdates = updates.map(update => update.postedBy);

//     res.status(200).json(usersWithUpdates);
//   } catch (error) {
//     console.error('Error fetching followed users with updates:', error);
//     res.status(500).json({ error: 'Failed to get updates' });
//   }
// };

const hasUpdates = async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = await Update.find({ postedBy: userId });
    const hasUpdates = updates.length > 0;
    res.status(200).json({ hasUpdates });
  } catch (error) {
    console.error('Error checking updates:', error);
    res.status(500).json({ error: 'Failed to check updates' });
  }
};

export {
  createUpdate,
  getUpdates,
  deleteUpdateById,
  incrementViewCount,
  getViewers,
  // getFollowedUsersWithUpdates,
  hasUpdates,
};