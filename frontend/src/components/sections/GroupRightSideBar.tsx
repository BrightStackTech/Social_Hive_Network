import { useEffect, useState } from "react"
import { Input } from "../ui/input"
import {FaUserFriends} from  'react-icons/fa'
import { Button } from "../ui/button"
import {  getGroupForVisitors, requestToJoinGroup } from "@/api/index"
import { useAuth } from "@/context/AuthContext"

function GroupRightSideBar() {
    const [group, setGroup] = useState<any>([])
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(false)
    const [requested, setRequested] = useState(false)
    const {user} = useAuth()    
    useEffect(() => {
        const fetchGroups = async () => {
            setLoading(true)
            const data = await getGroupForVisitors({groupId:search})
            setGroup(data.data.data)
            if(data.data.data.joinRequests.includes(user?._id)){
                setRequested(true)
            }
            setLoading(false)
        }
        fetchGroups()
    }, [search])
    const handleRequestClick = (groupId:string)=>{
      if(group.joinRequests.includes(user?._id)){
        return
      }
      requestToJoinGroup({groupId}).then(()=>{
        setRequested(true)
      })
    }
    

  return (
    <div>
        <div className="search-groups p-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-200 mb-4">Search Groups</h2>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="text"
              placeholder="Search using Group Id"
              className="w-full border border-gray-300 dark:border-gray-700 rounded"
            />
            <div className="mt-4">
              {group._id  && !loading &&
                <div key={group._id} className="flex items-center justify-between p-2 border-b border-gray-300 dark:border-gray-700">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200">{group.name}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{group.description}</p>
                  </div>
                  <div>

                  <div className="text-gray-600 flex m-1 justify-end dark:text-gray-400">
                    <FaUserFriends className="w-6 h-6" />
                  </div>
                  {!group.members.some((member: any) => member._id === user?._id) && (
  <Button onClick={()=>handleRequestClick(group._id)} variant={requested ? "outline" : "default"} className="text-xs">
    {requested ? "Request Sent" : "Send Request"}
  </Button>
)}
                </div>


                  </div>
              }
              {search.length!=0  && group.length === 0 && <p className="text-gray-600 dark:text-gray-400">No groups found</p>}
            
          </div>
          
            
          </div>
    </div>
  )
}

export default GroupRightSideBar
