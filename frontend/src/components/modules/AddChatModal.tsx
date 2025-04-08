import { MessageCirclePlus } from "lucide-react"
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogClose,
    DialogFooter
} from "@/components/ui/dialog"
import { useState, useEffect } from "react"
import { useAuth, UserInterface } from "@/context/AuthContext"
import {createOrGetOneToOneChat, getFollowers} from '@/api/index'
import SelectWithSearch from "./SelectWithSearch"
import { Button } from "../ui/button"
import { ChatInterface } from "@/types"
function AddChatModal({chats,setChats}:{chats:ChatInterface[],setChats:Function}) {
    const [followers, setFollowers] = useState<UserInterface[]>([])
    const {user} = useAuth()
    const [selectedUser, setSelectedUser] = useState(null)
    const handleAddToChat = ()=>{
        if(!selectedUser) return
        if(chats.find((chat:ChatInterface)=>chat.participants.find((participant:UserInterface)=>participant.username == selectedUser))){
            
            return
        }
        
        const receiverId = followers.find((follower:UserInterface)=>follower.username == selectedUser)?._id
        createOrGetOneToOneChat({receiverId}).then((res)=>{
            setChats((prev:ChatInterface[])=>[res.data.data, ...prev])
        })
    }
    useEffect(()=>{
        getFollowers({username: user?.username}).then((res)=>{
            setFollowers(res.data.data)
        })
    },[])
  return (
    <div>
        <Dialog>
            <DialogTrigger>
                <MessageCirclePlus/>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Chat</DialogTitle>
                    <DialogDescription>
                        Add a follower to chats section
                    </DialogDescription>
                </DialogHeader>
                
               <SelectWithSearch 
               id="Followers"
               text="Select a follower to add to chat" 
               initialValue=""
               setValue={setSelectedUser}
               options={
                //an array of usernames of followers
                followers.map((follower:UserInterface)=>follower.username)
               } />
                <DialogClose>
                    <DialogFooter>
                        <Button onClick={handleAddToChat}>Add to chat</Button>
                    </DialogFooter>
                </DialogClose>
            </DialogContent>
        </Dialog>
    </div>
  )
}

export default AddChatModal
