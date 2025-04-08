import { Community } from '../models/community.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const createCommunity = asyncHandler(async (req, res) => {
  const { communityName, description, profilePicture } = req.body;
  const userId = req.user._id;

  if (!communityName || !description) {
    throw new ApiError(400, 'Community name and description are required');
  }

  const community = await Community.create({
    communityName,
    description,
    profilePicture, // Include profilePicture in the community creation
    admin: userId,
    joinedBy: [userId],
    joinedCount: 1,
  });

  if (!community) {
    throw new ApiError(500, 'Something went wrong while creating the community');
  }

  return res.status(201).json(new ApiResponse(201, community, 'Community created successfully'));
});

const checkCommunityNameUnique = asyncHandler(async (req, res) => {
  const { communityName } = req.query;

  if (!communityName) {
    throw new ApiError(400, 'Community name is required');
  }

  const community = await Community.findOne({ communityName });

  if (community) {
    return res.status(200).json(new ApiResponse(200, false, 'Community name already exists'));
  }

  return res.status(200).json(new ApiResponse(200, true, 'Community name is available'));
});

const getCommunityByName = asyncHandler(async (req, res) => {
  const { communityName } = req.params;

  const community = await Community.findOne({ communityName })
    .populate('admin', 'username')
    .populate('joinedBy', 'username profilePicture bio'); // Populate joinedBy with user details

  if (!community) {
    throw new ApiError(404, 'Community not found');
  }

  return res.status(200).json(new ApiResponse(200, community, 'Community fetched successfully'));
});

const updateCommunity = asyncHandler(async (req, res) => {
  const { communityName } = req.params;
  const { description, profilePicture } = req.body;

  const community = await Community.findOne({ communityName });

  if (!community) {
    throw new ApiError(404, 'Community not found');
  }

  community.description = description || community.description;
  community.profilePicture = profilePicture || community.profilePicture;

  await community.save();

  return res.status(200).json(new ApiResponse(200, community, 'Community updated successfully'));
});

const joinCommunity = asyncHandler(async (req, res) => {
  const { communityName } = req.params;
  const userId = req.user._id;

  const community = await Community.findOne({ communityName });

  if (!community) {
    throw new ApiError(404, 'Community not found');
  }

  if (community.joinedBy.includes(userId)) {
    throw new ApiError(400, 'User already joined the community');
  }

  community.joinedBy.push(userId);
  community.joinedCount += 1;

  await community.save();

  return res.status(200).json(new ApiResponse(200, community, 'Joined community successfully'));
});

const leaveCommunity = asyncHandler(async (req, res) => {
  const { communityName } = req.params;
  const userId = req.user._id;

  const community = await Community.findOne({ communityName });

  if (!community) {
    throw new ApiError(404, 'Community not found');
  }

  if (!community.joinedBy.includes(userId)) {
    throw new ApiError(400, 'User has not joined the community');
  }

  community.joinedBy = community.joinedBy.filter(id => id.toString() !== userId.toString());
  community.joinedCount -= 1;

  await community.save();

  return res.status(200).json(new ApiResponse(200, community, 'Left community successfully'));
});

const removeMember = asyncHandler(async (req, res) => {
  const { communityName, userId } = req.params;

  const community = await Community.findOne({ communityName });

  if (!community) {
    throw new ApiError(404, 'Community not found');
  }

  if (!community.joinedBy.includes(userId)) {
    throw new ApiError(400, 'User is not a member of the community');
  }

  community.joinedBy = community.joinedBy.filter(id => id.toString() !== userId.toString());
  community.removedMem.push(userId);
  community.joinedCount -= 1;

  await community.save();

  return res.status(200).json(new ApiResponse(200, community, 'User removed from community successfully'));
});

const sendJoinRequest = asyncHandler(async (req, res) => {
  const { communityName } = req.params;
  const userId = req.user._id;

  const community = await Community.findOne({ communityName });

  if (!community) {
    throw new ApiError(404, 'Community not found');
  }

  if (community.removedMem.includes(userId)) {
    community.removedMem = community.removedMem.filter(id => id.toString() !== userId.toString());
    community.pendingReq.push(userId);
  } else {
    throw new ApiError(400, 'User is not in removed members list');
  }

  await community.save();

  return res.status(200).json(new ApiResponse(200, community, 'Join request sent successfully'));
});

const handleJoinRequest = asyncHandler(async (req, res) => {
  const { communityName, userId, action } = req.params;

  const community = await Community.findOne({ communityName });

  if (!community) {
    throw new ApiError(404, 'Community not found');
  }

  if (!community.pendingReq.includes(userId)) {
    throw new ApiError(400, 'User has not sent a join request');
  }

  community.pendingReq = community.pendingReq.filter(id => id.toString() !== userId.toString());

  if (action === 'approve') {
    community.joinedBy.push(userId);
    community.joinedCount += 1;
  } else if (action === 'reject') {
    community.removedMem.push(userId);
  } else {
    throw new ApiError(400, 'Invalid action');
  }

  await community.save();

  return res.status(200).json(new ApiResponse(200, community, `User ${action}d successfully`));
});

const deleteCommunity = asyncHandler(async (req, res) => {
  const { communityName } = req.params;

  const community = await Community.findOneAndDelete({ communityName });

  if (!community) {
    throw new ApiError(404, 'Community not found');
  }

  return res.status(200).json(new ApiResponse(200, null, 'Community deleted successfully'));
});

const getUnjoinedCommunities = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const communities = await Community.find({ joinedBy: { $ne: userId } });

  return res.status(200).json(new ApiResponse(200, communities, 'Unjoined communities fetched successfully'));
});

const cancelJoinRequest = asyncHandler(async (req, res) => {
  const { communityName } = req.params;
  const userId = req.user._id;

  const community = await Community.findOne({ communityName });

  if (!community) {
    throw new ApiError(404, 'Community not found');
  }

  if (!community.pendingReq.includes(userId)) {
    throw new ApiError(400, 'User has not sent a join request');
  }

  community.pendingReq = community.pendingReq.filter(id => id.toString() !== userId.toString());
  community.removedMem.push(userId);

  await community.save();

  return res.status(200).json(new ApiResponse(200, community, 'Join request cancelled successfully'));
});

const getPendingRequests = asyncHandler(async (req, res) => {
  const { communityName } = req.params;

  const community = await Community.findOne({ communityName }).populate('pendingReq', 'username profilePicture');

  if (!community) {
    throw new ApiError(404, 'Community not found');
  }

  return res.status(200).json(new ApiResponse(200, community.pendingReq, 'Pending requests fetched successfully'));
});

const getJoinedCommunities = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const communities = await Community.find({ joinedBy: userId });
  return res.status(200).json(new ApiResponse(200, communities, 'Joined communities fetched successfully'));
});

// const searchCommunities = asyncHandler(async (req, res) => {
//   const { query } = req.query;
//   const communities = await Community.find({ communityName: { $regex: query, $options: 'i' } });
//   res.status(200).json(new ApiResponse(200, communities, 'Communities fetched successfully'));
// });

const searchCommunities = async (req, res) => {
  try {
    const { query } = req.query;
    const communities = await Community.find({
      communityName: { $regex: query, $options: "i" },
    }).limit(5); // limit or paginate
    res.status(200).json({ communities });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export {
  createCommunity, checkCommunityNameUnique, getCommunityByName, updateCommunity,
  joinCommunity, leaveCommunity, removeMember, deleteCommunity, getUnjoinedCommunities,
  sendJoinRequest, handleJoinRequest, cancelJoinRequest, getPendingRequests,
  getJoinedCommunities, searchCommunities
};