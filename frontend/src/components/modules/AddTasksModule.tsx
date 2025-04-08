import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {Select
    ,SelectContent
    ,SelectItem
    ,SelectTrigger
    ,SelectValue
    ,SelectGroup
}  from '@/components/ui/select'
import { useState,useEffect } from 'react'
import {
    Checkbox
} from '@/components/ui/checkbox'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { createTask, sendNotificationToUser } from '@/api/index'
import { toast } from 'react-toastify'
import { useAuth } from '@/context/AuthContext'
import { X } from 'lucide-react'

function AddTasksModule({members,
    projectId, type, refreshFunc
}:{members?:any[], projectId:string, type:string, refreshFunc:()=>void}) {
    const { user } = useAuth()
    const [open, setOpen] = useState(false)
    const [taskName, setTaskName] = useState('')
    const [taskDescription, setTaskDescription] = useState('')
    const [taskAssignees, setTaskAssignees] = useState<any>([])
    const [taskDueDate, setTaskDueDate] = useState('')
    const [taskStatus, setTaskStatus] = useState('')
    const [taskAssigneeSearch,  setTaskAssigneeSearch] = useState('')
    const [filteredMembers, setFilteredMembers] = useState(members)
    const [taskPriority
        , setTaskPriority] = useState('')
    const [errors, setErrors] = useState<any>([])
    const handleAddTask = () => {
        // Handle adding the task
        let error = []
        if(taskName == '')
            error.push('Task name is required')
        
        if(type != "individual" && taskAssignees.length == 0)
            error.push('At least one assignee is required')
        if(taskPriority == '')
            error.push('Task priority is required')

        if(error.length > 0) {
            setErrors(error)
            return
        }
       
        


        const taskData = {
            title: taskName,
            description: taskDescription,
            dueDate: taskDueDate,
            status:taskStatus,
            priority: taskPriority,
            assignedTo: type == "individual" ? [user?._id] : taskAssignees,
            projectId
        }
        createTask({taskData}).then(() => {
            toast.success('Task added successfully')
            refreshFunc()
            taskData.assignedTo.map(
                (assignee:any) => {
                    if(type == "group")
                    sendNotificationToUser({
                        title: `New Task`,
                        body: `You have been assigned a new task: ${taskData.title}`,
                        userId: assignee
                    })

                }
            )
        })
        setOpen(false)
    }
    useEffect(() => {
        if(taskAssigneeSearch.length == 0) {
            setFilteredMembers(members)
            return
        }
        const filtered = members?.filter((member) =>
            member.username.toLowerCase().includes(taskAssigneeSearch.toLowerCase())
        )
        setFilteredMembers(filtered)
    }, [taskAssigneeSearch, members])
    const clearAllValues = () => {
        setTaskName('')
        setTaskDescription('')
        setTaskAssignees([])
        setTaskDueDate('')
        setTaskStatus('')
        setTaskAssigneeSearch('')
        setOpen(!open)
        setFilteredMembers(members)
        setTaskPriority('')
        setErrors([])
    }
  return (
    <div>
        <Dialog
            open={open} onOpenChange={clearAllValues}>
            <DialogTrigger asChild>
                <Button variant="outline">Add Task</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] md:max-w-[50vw] ">
                <DialogTitle>Add Task</DialogTitle>
                {errors && <div className="text-red-500">{
                    errors.map((error:any) => {
                        return <div>{error}</div>
                    })
                    }</div>}
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="name" className="text-right">
                            Task Name <span className='text-red-500'>*</span>
                        </label>
                        <div className="col-span-3">

                        <Input
                            id="name"
                            
                            value={taskName}
                            onChange={(e) => setTaskName(e.target.value)}
                            className="col-span-3"
                            />
                            </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="description" className="text-right">
                            Task Description
                        </label>
                        <div className="col-span-3">

                        <Input
                            id="description"
                            value={taskDescription}
                            onChange={(e) => setTaskDescription(e.target.value)}
                            
                            />
                            </div>
                    </div>
                  {type != "individual" &&  <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="assignee" className="text-right">
                            Task Assigned to     <span className='text-red-500'>*</span>
                        
                        </label>
                        <div className="col-span-3">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <div>

                                    {taskAssignees.length == 0 && <Button variant="secondary" className='w-full'>Select Assignees</Button>}

                                    {taskAssignees.length > 0 && <div className='w-full h-auto max-h-[80px] overflow-y-auto hover:bg-black'>
                                        <div className="flex flex-col gap-2 md:flex-row p-2 md:flex-wrap md:gap-5 justify-start">
                                            {taskAssignees.map((assignee:any) => {
                                                return <div className="bg-muted rounded-full p-2 w-fit flex gap-2">
                                                    <div>
                                                        <img src={members?.find((member) => member._id == assignee)?.profilePicture} alt="pfp" className='w-5 h-5 rounded-full' />
                                                    </div>
                                                    <div>
                                                    {members?.find((member) => member._id == assignee)?.username}
                                                    </div>
                                                    <div className="ml-2 cursor-pointer" onClick={(e) => {
                                                        e.stopPropagation()
                                                        setTaskAssignees(taskAssignees.filter((id:any) => id !== assignee))
                                                    }}>
                                                        <X/>
                                                    </div>
                                                </div>
                                            })}
                                        </div>    
                                    </div>}
                                    </div>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                   
                                    <Input

                                    id="assignee"
                                    className='mb-2'
                                    placeholder="Search Assignees"
                                    value={taskAssigneeSearch}
                                    onChange={(e) => setTaskAssigneeSearch(e.target.value)}
                                    />
                                <div className="col-span-3 flex flex-col gap-2 max-h-[30vh] overflow-y-auto">
                            {
                                filteredMembers?.map((member) =>{ return(
                                    <div className='flex items-center gap-2'>
                                    <Checkbox
                                        key={member._id}
                                        id={member._id}
                                        value={member._id}
                                        checked={taskAssignees.includes(member._id)}
                                        onCheckedChange={(checked) => {
                                            if (checked) {
                                                setTaskAssignees([...taskAssignees, member._id])
                                            } else {
                                                setTaskAssignees(taskAssignees.filter((id:any) => id !== member._id))
                                            }
                                        }}
                                    >
                                       
                                    </Checkbox>
                                    <div>{member.username}</div>
                                    </div>
                                    
                                )})
                            }
                        </div>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        


                        
                    </div>}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="dueDate" className="text-right">
                            Task Due Date
                        </label>
                        <div className="col-span-3">

                        <Input
                            id="dueDate"
                            type="date"
                            value={taskDueDate}
                            onChange={(e) => setTaskDueDate(e.target.value)}
                            
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="status" className="text-right">
                            Task Status
                        </label>
                        <Select
                            onValueChange={(value) => setTaskStatus(value)}

                            value={taskStatus}
                        >
                            <SelectTrigger className="col-span-3">
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
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="priority" className="text-right">
                            Task Priority <span className='text-red-500'>*</span>
                        </label>
                        <Select
                            onValueChange={(value) => setTaskPriority(value)}
                            value={taskPriority}
                        >
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select a priority" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="flex justify-end">
                    <Button onClick={handleAddTask}>Add Task</Button>
                </div>
            </DialogContent>
        </Dialog>
    </div>
  )
}

export default AddTasksModule
