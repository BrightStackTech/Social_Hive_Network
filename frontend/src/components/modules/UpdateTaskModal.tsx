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
import { updateTask, getProject } from '@/api/index'


function UpdateTaskModal({task, closeOtherModal, refreshFunc
}:{task:any, 
    closeOtherModal?:(value:boolean)=>void,
    refreshFunc:()=>void

}) {
    const [open, setOpen] = useState(false)
    const [taskName, setTaskName] = useState(task.title)
    const [members, setMembers] = useState<any[]>([])
    const [taskDescription, setTaskDescription] = useState(task.description)
    //task.assignedTo = [{_id:387420370, username:uehuhe},{},{}]
    //taskAssignees = [387420370,...]
    const [taskAssignees, setTaskAssignees] =useState<any[]>(task.assignedTo
        .map((assignee:any) => assignee._id)
    
    )
    const [taskDueDate, setTaskDueDate] = useState(new Date(task.dueDate).toLocaleString(
        //yyyy-mm-dd
        'sv-SE', {year: 'numeric', month: '2-digit', day: '2-digit'}
    ))
    const [taskStatus, setTaskStatus] = useState(task.status)
    const [taskAssigneeSearch,  setTaskAssigneeSearch] = useState('')
    const [filteredMembers, setFilteredMembers] = useState(members)
    const [taskPriority
        , setTaskPriority] = useState(task.priority)
    const [errors, setErrors] = useState<any>([])
    const handleUpdateTask = () => {
        // Handle adding the task
        let error = []
        if(taskName == '')
            error.push('Task name is required')
        
        if(taskAssignees.length == 0)
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
            assignedTo: taskAssignees,
            projectId:task.project
        }
        updateTask({taskId:task._id, updateData:taskData}).then(() => {
            closeOtherModal && closeOtherModal(false)
            clearAllValues()
            refreshFunc()
            setOpen(false)
        })
    }
    useEffect(() => {
        if(taskAssigneeSearch.length == 0) {
            setFilteredMembers(members)
            return
        }
        const filtered = members.filter((member) =>
            member.username.toLowerCase().includes(taskAssigneeSearch.toLowerCase())
        )
        setFilteredMembers(filtered)
    }, [taskAssigneeSearch, members])
    useEffect(() => {
        
        getProject({projectId:task.project}).then((res) => {
            if(res.data.data.type == "group") setMembers(res.data.data.group.members)     
        })
    }, [])
   
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
            open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">Update Task Details</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] md:max-w-[50vw] ">
                <DialogTitle>Update Task</DialogTitle>
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
                    {members[0] &&
                    <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="assignee" className="text-right">
                            Task Assigned to     <span className='text-red-500'>*</span>
                        
                        </label>
                         <div className="col-span-3">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="secondary" className='w-full'>Select Assignees</Button>
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
                                filteredMembers.map((member) =>{ return(
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
                    <Button onClick={handleUpdateTask}>Update Task</Button>
                </div>
            </DialogContent>
        </Dialog>
    </div>
  )
}

export default UpdateTaskModal
