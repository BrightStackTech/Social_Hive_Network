import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader, 
    DialogDescription, 
    DialogFooter,
    DialogTitle
} from '@/components/ui/dialog'
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardDescription,
} from '@/components/ui/card'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { useEffect, useState } from 'react'
import { updateGroupDetails,changeGroupAdmin } from '@/api/index'
import { toast } from 'react-toastify'


function GroupSettings({group, refreshFunc}:{group:any, refreshFunc:()=>void}) {
    const [groupName, setGroupName] = useState(group.name)
    const [groupDescription, setGroupDescription] = useState(group.description)
    const [updateButtonDisabled, setUpdateButtonDisabled] = useState(false)
    const [open, setOpen ] = useState(false)

    useEffect(()=>{
        if((groupName !== group.name || groupDescription !== group.description ) && groupName.length > 0){
            setUpdateButtonDisabled(false)
        }else{
            setUpdateButtonDisabled(true)
        }
    },[groupName, groupDescription, group.name, group.description])

    const handleUpdateDetails = ()=>{
        if((groupName !== group.name || groupDescription !== group.description)){
            const updateData = {
                name:groupName,
                description:groupDescription
            }
            updateGroupDetails({groupId:group._id, updateData}).then((res)=>{
                if(res.data.success){
                    toast.success(res.data.message)
                    setOpen(false)
                    refreshFunc()
                }
            }).catch((err)=>{
                toast.error(err.response.data.message)
            })
        }
    }
    
    const resetValues = ()=>{
        setGroupName(group.name)
        setGroupDescription(group.description)
        setOpen(!open)
    }

    const handleChangeAdmin = (userId:string)=>{
        
        changeGroupAdmin({groupId:group._id, userId}).then((res)=>{
            if(res.data.success){
                toast.success("Admin was changed successfully")
                window.location.reload()
            }
        }).catch((err)=>{
            toast.error(err.response.data.message)
        })
    }

  return (
    <div className='flex flex-col gap-4'>
        <Card>
            <CardHeader>
                <CardTitle>Update Group Details</CardTitle>

                <CardDescription>
                    Update name and description of the group
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Dialog open={open} onOpenChange={resetValues}>
                    <DialogTrigger>
                        <Button className='w-full'>Update Group Details</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Update Group Details</DialogTitle>
                        <DialogDescription>
                            Update name and description of the group
                        </DialogDescription>
                        </DialogHeader>
                        <Input value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="Group Name" />
                        <Input value={groupDescription} onChange={(e) => setGroupDescription(e.target.value)} placeholder="Group Description" />
                        <DialogFooter>
                            <Button disabled={updateButtonDisabled} onClick={handleUpdateDetails}>Update</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
        <Card>
            {/*Change Admin and Remove Admin */}
            <CardHeader>
                <CardTitle>Change Admin and Remove Admin</CardTitle>

                <CardDescription>
                    Change the current admin of the group
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className='flex flex-col gap-3'>
               {group.members.map((member:any)=>{
                   return(
                       <div key={member._id} className='flex border-b pb-2 items-center justify-between md:gap-4'>
                           <div className="flex items-center gap-4">
                                <img className='w-8 h-8 md:h-12 md:w-12 rounded-full' src={member.profilePicture} alt="profile pic"/>

                                <div>
                                    <p>{member.username}</p>
                                    <p className='text-xs text-muted-foreground overflow-ellipsis break-words'>({member.college.split('(')[1]}</p>
                                </div>
                           </div>
                           <div className="flex gap-4">
                                {member._id.toString() === group.admin._id.toString() ? <Button disabled variant={"ghost"}>Current Admin</Button>: 
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant={"default"}>Make Admin</Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Change Admin</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Are you sure you want to change the admin of this group?
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={()=>handleChangeAdmin(member._id.toString())}>Change</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                                }
                           </div>
                       </div>
                   )
               })}
               </div>
            </CardContent>
        </Card>
       
    </div>
  )
}

export default GroupSettings
