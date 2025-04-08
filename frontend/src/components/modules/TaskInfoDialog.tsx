import { useState } from "react"
import { Button } from "../ui/button"
import { Separator } from "../ui/separator"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "../ui/select"
import { updateTaskStatus,deleteTask } from "@/api/index"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import UpdateTaskModal from "./UpdateTaskModal"
import { toast } from "react-toastify"
import { Link } from "react-router-dom"
function TaskInfoDialog({task, admin, setOpen, refreshFunction}:{task:any, admin:boolean, setOpen:(value: boolean)=>void, refreshFunction:()=>void}) 
{
    const [taskStatus, setTaskStatus] = useState(task.status)
    const handleUpdateStatus = async()=>{
        updateTaskStatus({taskId:task._id, status:taskStatus})
        .then(()=>{
            setOpen(false)
            refreshFunction()
            toast.success("Task status updated successfully")
        })
        
    }
  return (
    <div>

        <div className="text-lg font-bold">{task.title}</div>
        <Separator className="my-2"/>
        <div className="text-sm">{task.description}</div>
        <Separator className="my-2"/>
        <div className="text-sm">Status: {task.status}</div>
        <div className="text-sm">Priority: {task.priority}</div>
        <div className="text-sm">Due Date: {new Date(task.dueDate).toLocaleDateString(
            'en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            }
        )}</div>
        <Separator className="my-2"/>
        <div>Assigned to: {
            task.assignedTo.map((user:any)=>(
                <Link to={`/user/${user.username}`} key={user.id} className="text-sm block underline text-blue-500">{user.username}</Link>
            ))    
        }</div>
        <Separator className="my-2"/>
        <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="status" className="text-right">
                            Task Status
                        </label>
                        <Select
                            onValueChange={(value) => setTaskStatus(value)}

                            value={taskStatus}
                        >
                            <SelectTrigger className="col-span-2">
                                <SelectValue placeholder="Select a status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="todo">To Do</SelectItem>
                                    <SelectItem value="in progress">In Progress</SelectItem>
                                    <SelectItem value="completed">Done</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        <Button onClick={handleUpdateStatus} className="col-span-1">Update</Button>
        </div>
        <Separator className="my-2"/>
        <div className="flex justify-around items-center">

        {admin &&
        <div>
            <UpdateTaskModal refreshFunc={refreshFunction} closeOtherModal={setOpen}  task={task}/>
        </div>
        }
        {admin && 
        <AlertDialog>
        <AlertDialogTrigger asChild>
            <Button variant="destructive">Delete Task</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your task
                and remove your data from our servers.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={()=>deleteTask({taskId:task._id}).then(
                ()=>{
                    setOpen(false)
                    toast.success("Task deleted successfully")
                    if(refreshFunction) refreshFunction()

                }
            )}>Continue</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
        </AlertDialog>
       }
        </div>

    </div>
  )
}

export default TaskInfoDialog
