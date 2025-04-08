import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  dueDate: {
    type: Date,
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    required: true,
  },
  status: {
    type: String,
    enum: ["todo", "in progress", "completed"],
    default: "todo",
  },
  assignedTo:[
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }
    
  ],
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
  },
  
},{
  timestamps:true
});
export const Task = mongoose.model("Task", taskSchema);