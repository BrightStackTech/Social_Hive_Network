import {Task} from '../models/task.model.js'
import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import { Project } from '../models/project.model.js'
import {Group} from '../models/group.model.js'

const createTask = asyncHandler(async (req, res) => {
    const {title, description, dueDate, priority, assignedTo, projectId, status} = req.body
    const userId = req.user._id

    if (!title || !projectId) {
        throw new ApiError(400, 'Title and projectId are required')
    }
    const project = await Project.findById(projectId)
    if (!project) {
        throw new ApiError(404, 'Project not found')
    }
    if (project.createdBy._id.toString() !== userId.toString()) {
        throw new ApiError(403, 'You are not authorized to create task for this project')
    }
    if(project.type == "group" && assignedTo && assignedTo.length > 0){
    const group = await Group.findById(project.group)
    for(
        let i of assignedTo
    ){
        if(!group.members.includes(i)){
            throw new ApiError(400, 'Member not found in group')
        }
    }
}
  
       
    const task = await Task.create({
        title,
        description,
        dueDate,
        priority,
        status: status || "todo",
        assignedTo,
        project: projectId,
        
    })
    project.tasks.push(task._id)
    await project.save()

    if (!task) {
        throw new ApiError(500, 'Something went wrong while creating task')
    }

    return res.status(201).json(
        new ApiResponse(201, task, 'Task created successfully')
    )
})
const getTask = asyncHandler(async (req, res) => {
    const {taskId} = req.params
    const userId = req.user._id

    const task = await Task.findById(taskId)
        .populate('assignedTo', 'username email')
        .populate('project', 'title')
    if (!task) {
        throw new ApiError(404, 'Task not found')
    }
    const project = await Project.findById(task.project)
    if (!project) {
        throw new ApiError(404, 'Project not found')
    }
    if(project.type == "group" &&(!task.assignedTo.includes(userId))
     && (project.createdBy._id.toString() !== userId.toString()) )
        throw new ApiError(403, 'You are not authorized to view this task')
    if(project.type == "individual" && project.createdBy._id.toString() !== userId.toString())
        throw new ApiError(403, 'You are not authorized to view this task')
    return res.status(200).json(
        new ApiResponse(200, task, 'Task fetched successfully')
    )
})
const updateTask = asyncHandler(async (req, res) => {
    const {taskId} = req.params
    const userId = req.user._id
    const {title, description, dueDate, priority, assignedTo} = req.body

    const task = await Task.findById(taskId)
    if (!task) {
        throw new ApiError(404, 'Task not found')
    }
    const project = await Project.findById(task.project)
    if (!project) {
        throw new ApiError(404, 'Project not found')
    }
    if (project.createdBy._id.toString() !== userId.toString()) {
        throw new ApiError(403, 'You are not authorized to update this task')
    }
    task.title = title || task.title
    task.description = description || task.description
    task.dueDate = dueDate || task.dueDate
    task.priority = priority || task.priority
    task.assignedTo = assignedTo || task.assignedTo
    await task.save()

    return res.status(200).json(
        new ApiResponse(200, task, 'Task updated successfully')
    )
})
const updateTaskStatus = asyncHandler(async (req, res) => {
    const {taskId} = req.params
    const userId = req.user._id
    const {status} = req.body

    const task = await Task.findById(taskId)
    if (!task) {
        throw new ApiError(404, 'Task not found')
    }
   if(!task.assignedTo.includes(userId)){
        throw new ApiError(403, 'You are not authorized to update this task')
   }
    task.status = status
    await task.save()

    return res.status(200).json(
        new ApiResponse(200, task, 'Task status updated successfully')
    )
})
const deleteTask = asyncHandler(async (req, res) => {
    const {taskId} = req.params
    const userId = req.user._id

    const task = await Task.findById(taskId)
    if (!task) {
        throw new ApiError(404, 'Task not found')
    }
    const project = await Project.findById(task.project)
    if (!project) {
        throw new ApiError(404, 'Project not found')
    }
    if (project.createdBy._id.toString() !== userId.toString()) {
        throw new ApiError(403, 'You are not authorized to delete this task')
    }
    await Task.findByIdAndDelete(taskId)
    await Project.findByIdAndUpdate(task.project, {$pull: {tasks: taskId}})

    return res.status(200).json(
        new ApiResponse(200, {}, 'Task deleted successfully')
    )
})

const getMyTasks = asyncHandler(async(req, res)=>{
    const {projectId} = req.params
    const userId = req.user._id
    const tasks = await Task.find({
        project: projectId,
        assignedTo:{$in:[userId]}
    }).populate('assignedTo', 'username profilePicture email')
    .sort({
       createdAt: -1
    })
    return res.status(200).json(
        new ApiResponse(200, tasks, 'Tasks fetched successfully')
    )
})

const getOthersTasks = asyncHandler(async(req, res)=>{
    const {projectId} = req.params
    const userId = req.user._id
    const tasks = await Task.find({
        project: projectId,
        assignedTo:{$nin:[userId]}
    }).populate('assignedTo', 'username profilePicture email')
    .sort({
       createdAt: -1
    })

    return res.status(200).json(
        new ApiResponse(200, tasks, 'Tasks fetched successfully')
    )
})

const deleteUserTasks = asyncHandler(async(req, res)=>{
    const {userId, projectId} = req.params
    const tasks = await Task.updateMany(
        {project: projectId, assignedTo:
            {$in: [userId]}
        },
        {$pull: {assignedTo: userId}}
    )
    return res.status(200).json(
        new ApiResponse(200, tasks, 'Tasks deleted successfully')
    )
})

export {
    createTask,
    getTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
    getMyTasks,
    getOthersTasks,
    deleteUserTasks
}