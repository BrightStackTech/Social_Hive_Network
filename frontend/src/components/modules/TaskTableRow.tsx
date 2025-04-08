import { useAuth } from "@/context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import TaskInfoDialog from "./TaskInfoDialog";
import { useState } from "react";
function TaskTableRow({ task, admin, refreshFunction }: { task: any, admin:boolean; refreshFunction: () => void }) {
  const { user } = useAuth();

  const [open, setOpen] = useState(false);
  const usernames = task.assignedTo.map((otherUser: any) => {
    if (otherUser._id == user?._id) return "You";
    return otherUser.username;
  });
  const taskDueDate = new Date(task.dueDate)
  return (
    <Dialog 
    open={(usernames.includes("You") || admin )?open:false} onOpenChange={setOpen}>
      <DialogTrigger className="w-full">   
    <div className="grid grid-cols-4 md:grid-cols-5 p-5 items-center bg-muted my-2 place-items-center hover:bg-gray-900 duration-100 cursor-pointer" >
      <div>{task.title}</div>
      <div>{task.status}</div>
      <div className="hidden md:block">
        {usernames.length > 1
          ? `${usernames.slice(0, -1).join(", ")} and ${
              usernames[usernames.length - 1]
            }`
          : usernames[0]}
      </div>
      <div>{task.priority}</div>
      <div
        className={`${
          taskDueDate.getTime() - Date.now() <= 72 * 60 * 60 * 1000
            ? taskDueDate.getTime()- Date.now() <= 0
              ? "text-red-500"
              : "text-yellow-500"
            : "text-green-500"
        }`}
      >
        {task.dueDate
          ? new Date(task.dueDate).toLocaleDateString("en-US", {
              year: "2-digit",
              month: "short",
              day: "numeric",
              weekday: "short",
            })
          : "No Due Date"}
      </div>
    </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Task Details</DialogTitle>
          
        </DialogHeader>
            <TaskInfoDialog task={task} setOpen={setOpen} admin={admin} 
            refreshFunction={refreshFunction}/>
        <DialogFooter>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default TaskTableRow;
