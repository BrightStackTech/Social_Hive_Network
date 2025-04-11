import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { LiveSession } from "../models/livesession.model.js";
import axios from "axios";

// Create a new live session using meetingId; if one exists, throw an error.
export const createLiveSession = asyncHandler(async (req, res) => {
  const { meetingId, sessionName } = req.body;
  if (!meetingId) {
    throw new ApiError(400, "Meeting id is required");
  }
  if (!sessionName || sessionName.trim().length === 0) {
    throw new ApiError(400, "Session name is required");
  }
  if (!req.user || !req.user._id) {
    throw new ApiError(401, "User not authenticated");
  }
  const userId = req.user._id;
  const exists = await LiveSession.findOne({ meetingId });
  if (exists) {
    throw new ApiError(400, "Live session already exists");
  }
  const liveSession = await LiveSession.create({
    meetingId,
    title: sessionName,
    participants: [userId],
    recordings: [],
  });
  return res.status(201).json(
    new ApiResponse(201, liveSession, "Live session created successfully")
  );
});

// Add the current user as a participant to an existing session.
// Endpoint expects meetingId in req.params.
export const addParticipantToLiveSession = asyncHandler(async (req, res) => {
  const { meetingId } = req.params;
  if (!meetingId) {
    throw new ApiError(400, "Meeting id is required in parameters");
  }
  if (!req.user || !req.user._id) {
    throw new ApiError(401, "User not authenticated");
  }
  const userId = req.user._id;
  const liveSession = await LiveSession.findOne({ meetingId });
  if (!liveSession) {
    throw new ApiError(404, "Live session not found");
  }
  if (!liveSession.participants.includes(userId)) {
    liveSession.participants.push(userId);
  }
  await liveSession.save();
  return res
    .status(200)
    .json(new ApiResponse(200, liveSession, "Participant added successfully"));
});

export const updateRecordingURL = asyncHandler(async (req, res) => {
  const { meetingId } = req.params;
  if (!meetingId) {
    throw new ApiError(400, "Meeting id is required");
  }
  // Request the recording details from the external API
  const jwtToken = process.env.VIDEOSDK_TOKEN;
  const recordingsUrl = `https://api.videosdk.live/v2/recordings?roomId=${meetingId}`;
  const response = await axios.get(recordingsUrl, {
    headers: {
      Authorization: jwtToken,
    },
  });
  // Extract all available fileUrl values from the data array.
  const recordings =
    response.data &&
    response.data.data &&
    Array.isArray(response.data.data)
      ? response.data.data
          .filter(entry => entry.file && entry.file.fileUrl)
          .map(entry => entry.file.fileUrl)
      : [];

  if (recordings.length > 0) {
    const liveSession = await LiveSession.findOne({ meetingId });
    if (!liveSession) {
      throw new ApiError(404, "Live session not found");
    }
    // Save the recordings array in the document
    liveSession.recordings = recordings;
    await liveSession.save();
    return res
      .status(200)
      .json(
        new ApiResponse(200, liveSession, "Recording URL updated successfully")
      );
  } else {
    throw new ApiError(404, "Recording not found for meeting");
  }
});

export const getLiveSessionsHistory = asyncHandler(async (req, res) => {
  // Use req.user (set via verifyJWT middleware) to filter sessions.
  const userId = req.user._id;
  const sessions = await LiveSession.find({ participants: userId }).populate("participants", "username");
  return res.status(200).json(new ApiResponse(200, sessions, "History fetched successfully"));
});

export const updateSessionTitle = asyncHandler(async (req, res) => {
  const { meetingId } = req.params;
  const { newTitle } = req.body;
  if (!newTitle || newTitle.trim().length === 0) {
    throw new ApiError(400, "New session name is required");
  }
  if (!req.user || !req.user._id) {
    throw new ApiError(401, "User not authenticated");
  }
  const liveSession = await LiveSession.findOne({ meetingId });
  if (!liveSession) {
    throw new ApiError(404, "Live session not found");
  }
  // Only allow edit if current user is the first participant
  if (
    !liveSession.participants.length ||
    liveSession.participants[0].toString() !== req.user._id.toString()
  ) {
    throw new ApiError(403, "Not authorized to update the session name");
  }
  liveSession.title = newTitle;
  await liveSession.save();
  return res.status(200).json(
    new ApiResponse(200, liveSession, "Session name updated successfully")
  );
});

export const updateTerminatedAt = asyncHandler(async (req, res) => {
  const { meetingId } = req.params;
  if (!req.user || !req.user._id) {
    throw new ApiError(401, "User not authenticated");
  }
  const liveSession = await LiveSession.findOne({ meetingId });
  if (!liveSession) {
    throw new ApiError(404, "Live session not found");
  }
  // Only allow terminate if current user is the first participant
  if (
    !liveSession.participants.length ||
    liveSession.participants[0].toString() !== req.user._id.toString()
  ) {
    throw new ApiError(403, "Not authorized to terminate the session");
  }
  liveSession.terminatedAt = new Date();
  await liveSession.save();
  return res.status(200).json(
    new ApiResponse(200, liveSession, "Session terminated successfully")
  );
});

export const endMeetingForAll = async (meetingId) => {
  const jwtToken = process.env.VIDEOSDK_TOKEN;
  const getSessionUrl = `https://api.videosdk.live/v2/sessions?roomId=${meetingId}`;
  const { data } = await apiClient.get(getSessionUrl, {
    headers: {
      Authorization: jwtToken,
    },
  });
  const sessionId = data?.data?.[0]?.id;
  if (sessionId) {
    const endSessionUrl = `https://api.videosdk.live/v1/meeting-sessions/${sessionId}/end`;
    await apiClient.post(endSessionUrl, {}, {
      headers: {
        Authorization: jwtToken,
      },
    });
  }
};
