import {Group} from '../models/group.model.js'
import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import {User} from '../models/user.model.js'
import { Project } from '../models/project.model.js'
import { Task } from '../models/task.model.js'
import {Chat} from '../models/chat.model.js'
import {emitSocketEvent} from '../socket/index.js'
import { ChatEventEnum } from '../constants.js'
import mongoose from 'mongoose'
const createGroup = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    if (!name) {
        throw new ApiError(400, "Group name is required")
    }
    const group = await Group.create({
        name,
        description,
        admin: req.user._id,
        members: [req.user._id]
    })
    if (!group) {
        throw new ApiError(500, "Something went wrong while creating group")
    }
    await Chat.create({
        admin: group.admin,
        isGroupChat: true,
        chatType: "group",
        name: group.name,
        participants:group.members,
        group:group._id
    })
    const user = await User.findByIdAndUpdate(req.user._id, {$push: {groups: group._id}}, {new: true})
    .select('-password -refreshToken')
    return res.status(201).json(new ApiResponse(201, {user,group}, "Group created successfully"))
})

const isGroupNameUnique = asyncHandler(async (req, res) => {
    const {name} = req.body
    const group = await Group.findOne({name})
    if (group) {
        return res.status(200).json(new ApiResponse(200, {isUnique: false}, "Group name already exists"))
    }
    return res.status(200).json(new ApiResponse(200, {isUnique: true}, "Group name is unique"))
})


const getGroup = asyncHandler(async (req, res) => {
    const {groupId} = req.params
    const group = await Group.findById(groupId)
        .populate('admin', 'username email profilePicture college engineeringDomain')
        .populate('members', 'username email profilePicture college engineeringDomain')
        .populate('projects', '')
    //populate joinRequests only req.user._id == group.admin._id
    if(!group.members.
        some(member => member._id.equals(req.user._id)) 
    ){
        throw new ApiError(403, "User is not a member of this group")
    }
    if (req.user._id.equals(group.admin._id)) {
        group.joinRequests = await User.find({_id: {$in: group.joinRequests}}, 'username email profilePicture')
    } else {
        group.joinRequests = []
    }
    
    if (!group) {
        throw new ApiError(404, "Group not found")
    }
    return res.status(200).json(new ApiResponse(200, group, "Group found"))
})

const getGroupForVisitors = asyncHandler(async (req, res) => {
    const {groupId} = req.params
    const group = await Group.findById(groupId)
    .populate('admin', 'username email profilePicture')
    .populate('members', 'username email profilePicture')
    .populate('projects', '')
    
    if (!group) {
        throw new ApiError(404, "Group not found")
    }
    if(group.members.some(
        member => member._id.equals(req.user._id)
    )){
        throw new ApiError(403, "User is already a member of this group")
    }
    if(group.joinRequests.includes(req.user._id)){
        group.joinRequests = [req.user._id]
    }
    else{
    group.joinRequests = []
    }
    return res.status(200).json(new ApiResponse(200, group, "Group found"))
})

const exitFromGroup = asyncHandler(async (req, res) => {
    const {groupId} = req.params
    const group = await Group.findById(groupId)
    if (!group) {
        throw new ApiError(404, "Group not found")
    }
    if (!group.members.includes(req.user._id)) {
        throw new ApiError(400, "User is not a member of this group")
    }
    group.members = group.members.filter(member => member.toString() !== req.user._id.toString())
    await group.save()
    await Chat.findOneAndUpdate({group: groupId}, { $pull: { participants: new mongoose.Types.ObjectId(req.user._id) } }, {new: true}) 
        group.projects.forEach(async(project) => {
        await Task.deleteMany({
            project: project._id,
            assignedTo: { $size: 1, $eq: [req.user._id] }
        });
        await Task.updateMany(
            { project: project._id, assignedTo: { $in: [req.user._id] } },
            { $pull: { assignedTo: req.user._id } }
        );    
    })
    const user = await User.findByIdAndUpdate(req.user._id, {$pull: {groups: group._id}}, {new: true})
    .select('-password -refreshToken')
    return res.status(200).json(new ApiResponse(200, null, "User left from group"))
})

const requestToJoinGroup = asyncHandler(async (req, res) => {
    const {groupId} = req.params
    const group = await Group.findById(groupId)
    if (!group) {
        throw new ApiError(404, "Group not found")
    }
    if (group.joinRequests.includes(req.user._id)) {
        throw new ApiError(400, "Request already sent")
    }
    if(group.members.includes(req.user._id))
        throw new ApiError(400, "User already the member of the group")
    group.joinRequests.push(req.user._id)
    await group.save()
    group.projects.forEach(async(project) => {
        await Task.deleteMany({
            project: project._id,
            assignedTo: { $size: 1, $eq: [req.user._id] }
        });
        await Task.updateMany(
            { project: project._id },
            { assignedTo: req.user._id },
            { $pull: { assignedTo: req.user._id } }
        );    
    })
    const user = await User.findByIdAndUpdate(req.user._id, {$push: {pendingGroupRequests: group._id}}, {new: true})
    .select('-password -refreshToken')
    return res.status(200).json(new ApiResponse(200, null, "Request sent"))
})

const acceptRequest = asyncHandler(async (req, res) => {
    const {groupId, userId} = req.params
    const group = await Group.findById(groupId)
    if (!group) {
        throw new ApiError(404, "Group not found")
    }
    if(
        !group.admin.equals(req.user._id)
    ){
        throw new ApiError(403, "You are not authorized to accept requests")
    }
    if (!group.joinRequests.includes(userId)) {
        throw new ApiError(400, "Request not found")
    }
    group.joinRequests = group.joinRequests.filter(request => request.toString() !== userId.toString())
    group.members.push(userId)
    await group.save()
    const user = await User.findByIdAndUpdate(userId, {$push: {groups: group._id}, $pull: {pendingGroupRequests: group._id}}, {new: true})
    .select('-password -refreshToken')
    const chat = await Chat.findOneAndUpdate({group: groupId}, { $push: { participants: userId } }, {new: true})
    emitSocketEvent(req, userId, ChatEventEnum.NEW_CHAT_EVENT, chat)
    return res.status(200).json(new ApiResponse(200, group, "Request accepted"))
})

const rejectRequest = asyncHandler(async (req, res) => {
    const {groupId, userId} = req.params
    const group = await Group.findById(groupId)
    if (!group) {
        throw new ApiError(404, "Group not found")
    }
    if(
        !group.admin.equals(req.user._id)
    ){
        throw new ApiError(403, "You are not authorized to reject requests")
    }
    if (!group.joinRequests.includes(userId)) {
        throw new ApiError(400, "Request not found")
    }
    group.joinRequests = group.joinRequests.filter(request => request.toString() !== userId.toString())
    await group.save()

    const user = await User.findByIdAndUpdate(userId, {$pull: {pendingGroupRequests: group._id}}, {new: true})
    .select('-password -refreshToken')
    return res.status(200).json(new ApiResponse(200, group, "Request rejected"))
})

const addToGroup = asyncHandler(async (req, res) => {
    const {groupId, userId} = req.params
    const group = await Group.findById(groupId)
    if (!group) {
        throw new ApiError(404, "Group not found")
    }
    if(
        !group.admin.equals(req.user._id) 
    ){
        throw new ApiError(403, "You are not authorized to add users to this group")
    }
    if(group.members.includes(userId))
        throw new ApiError(400, "User already the member of the group")
    if (!group.members.includes(userId)) {
        group.members.push(userId)
        const chat = await Chat.findOneAndUpdate({group: groupId}, { $push: { participants: userId } }, {new: true})
        emitSocketEvent(req, userId, ChatEventEnum.NEW_CHAT_EVENT, chat)

        await group.save()
    }

    const user = await User.findByIdAndUpdate(userId, {$push: {groups: group._id}}, {new: true})
    return res.status(200).json(new ApiResponse(200, {user,group}, "User added to group"))
})

const removeFromGroup = asyncHandler(async (req, res) => {
    const {groupId, userId} = req.params
    const group = await Group.findById(groupId)
    if (!group) {
        throw new ApiError(404, "Group not found")
    }
    if(
        !group.admin.equals(req.user._id)
    ){
        throw new ApiError(403, "You are not authorized to remove users from this group")
    }
    if(!group.members.includes(userId))
        throw new ApiError(400, "User is not a member of this group")
    if (group.members.includes(userId)) {
        group.members = group.members.filter(member => member.toString() !== userId.toString())
        await group.save()
        await Chat.findOneAndUpdate({group: groupId}, { $pull: { participants: new mongoose.Types.ObjectId(userId) } }, {new: true})
        group.projects.forEach(async(project) => {
            await Task.deleteMany({
                project: project._id,
                assignedTo: { $size: 1, $eq: [userId] }
            });
            await Task.updateMany(
                { project: project._id, assignedTo: userId},
                { $pull: { assignedTo: userId } }
            );    
        })
    }
    
    await User.findByIdAndUpdate(userId, {$pull: {groups: group._id}}, {new: true})

    return res.status(200).json(new ApiResponse(200, null, "User removed from group"))
})

const deleteGroup = asyncHandler(async (req, res) => {
    const {groupId} = req.params
    const group = await Group.findById(groupId)
    if (!group) {
        throw new ApiError(404, "Group not found")
    }
    if (!group.admin.equals(req.user._id)) {
        throw new ApiError(403, "You are not authorized to delete this group")
    }
    for(let id of group.members){
        await User.findByIdAndUpdate(id, 
            {
                $pull:{groups:group._id,}

            }
        )
    }

    for(let id of group.joinRequests){
        await User.findByIdAndUpdate(id,
            {
                $pull:{pendingGroupRequests:group._id,}

            }
        )
    }
    await Group.findByIdAndDelete(groupId)

    return res.status(200).json(new ApiResponse(200, null, "Group deleted successfully"))
})

const getMyGroups = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)
        .populate('groups', 'name description')
        .select('groups')
    return res.status(200).json(new ApiResponse(200, user.groups, "Groups found"))
})

const groupSuggestedPeople = asyncHandler(async (req, res) => {
    const {groupId} = req.params
    const group = await Group.findById(groupId)
    if (!group) {
        throw new ApiError(404, "Group not found")
    }
    const user = await User.findById(req.user._id)
    if(!group.admin.equals(user._id)){
        throw new ApiError(403, "You are not authorized to view suggested people")
    }
    const suggestedPeople = await User.aggregate([
        {
            $match: {
                _id: {$nin: [user._id, ...group.members, ...group.joinRequests]}
            }
        },
        {
            $sample: {size: 5}
        },
        {
            $project: {
                _id: 1,
                username: 1,
                email: 1,
                profilePicture: 1
            }
        }
    ])
    return res.status(200).json(new ApiResponse(200, suggestedPeople, "Suggested people found"))
})

const updateGroupDetails = asyncHandler(async (req, res) => {
    const {groupId} = req.params
    const {name, description} = req.body
    const group = await Group.findById(groupId)
    if (!group) {
        throw new ApiError(404, "Group not found")
    }
    if (!group.admin.equals(req.user._id)) {
        throw new ApiError(403, "You are not authorized to update this group")
    }
    if (name) {
        group.name = name
    }
    if (description) {
        group.description = description
    }
    await group.save()
    return res.status(200).json(new ApiResponse(200, group, "Group details updated"))
})

const changeGroupAdmin = asyncHandler(async (req, res) => {
    const {groupId, userId} = req.params
    const group = await Group.findById(groupId)
    if (!group) {
        throw new ApiError(404, "Group not found")
    }
    if (!group.admin.equals(req.user._id)) {
        throw new ApiError(403, "You are not authorized to change the admin of this group")
    }
    if (!group.members.includes(userId)) {
        throw new ApiError(400, "User is not a member of this group")
    }
    group.admin = userId
    for( let projects of group.projects){
        await Project.findByIdAndUpdate(projects, {createdBy: userId})
    }
    await group.save()
    return res.status(200).json(new ApiResponse(200, group, "Group admin changed"))
})

const getUserGroups = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const user = await User.findById(userId).populate('groups', 'name description profilePicture');
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  return res.status(200).json(new ApiResponse(200, user.groups, "User groups fetched successfully"));
});

export {
    createGroup,
    isGroupNameUnique,
    getGroup,
    getGroupForVisitors,
    addToGroup,
    exitFromGroup,
    requestToJoinGroup,
    acceptRequest,
    rejectRequest,
    removeFromGroup,
    deleteGroup,
    getMyGroups,
    groupSuggestedPeople,
    updateGroupDetails,
    changeGroupAdmin,
    getUserGroups,
}