import { useEffect, useState, useRef } from "react"
import ProfileSideBar from "@/components/sections/ProfileSideBar"
import { useAuth } from "@/context/AuthContext"
import {getMyGroups} from '@/api/index'
import { Button } from "@/components/ui/button"
import GroupRightSideBar from "@/components/sections/GroupRightSideBar"
import { useNavigate } from "react-router-dom"
import FloatingActionButton from "@/components/modules/FloatingActionButton"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import CreateGroupModal from "@/components/modules/CreateGroupModal"
import MobileUserNavbar from "@/components/sections/MobileUserNavbar"
function Groups() {
  document.title = "SocialHive- Groups"
    const { user } = useAuth();
    const navigate = useNavigate();
    const [groups, setGroups] = useState([]);
    const [loading,  setLoading] = useState(false);
    const scrollableDiv = useRef<HTMLDivElement>(null);
    useEffect(() => {
      
      const fetchGroups = async () => {
          setLoading(true);
          const data = await getMyGroups();
          setGroups(data.data.data);
          setLoading(false);
        };
        fetchGroups();
      }, []);
  return (
   <div>
      {user && <div className='flex'>
        <div className="hidden md:block md:w-1/4 border-0 border-r-[1px] h-screen">
        <ProfileSideBar/>
        </div>
        <div ref={scrollableDiv} className="md:w-[50%] w-full overflow-y-scroll scrollbar-hide border-0 border-r-[1px] h-screen">
          <MobileUserNavbar scrollableDiv={scrollableDiv}/>
        <div className="min-h-screen p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-200">Your Groups</h1>
      </div>
        {loading && <div className="grid md:grid-cols-2 gap-2">
        <div
        className='bg-muted w-auto h-40 animate-pulse'
        ></div>
        <div
        className='bg-muted w-auto h-40 animate-pulse'
        ></div>
        <div
        className='bg-muted w-auto h-40 animate-pulse'
        ></div>
        <div
        className='bg-muted w-auto h-40 animate-pulse'
        ></div>
        <div
        className='bg-muted w-auto h-40 animate-pulse'
        ></div>
        <div
        className='bg-muted w-auto h-40 animate-pulse'
        ></div>
        </div>
        }
        {!loading && groups.length == 0 && <div className="text-center text-gray-500">
          You have not joined any Group
          <div>
            Join a Group or <Dialog>
              <DialogTrigger asChild>
                <Button variant="link" className="p-0 m-0 text-blue-500">
                  Create a new Group
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create a New Group</DialogTitle>
                  <DialogDescription>
                    Enter the name and description for your new group.
                  </DialogDescription>
                </DialogHeader>
                <CreateGroupModal/>
               </DialogContent>
            </Dialog>
          </div>
          </div>}
      <div className="grid md:grid-cols-2 gap-2">
     {!loading && groups[0] && groups.map(
(group:any) => (
  <div className="group-item bg-gray-100 dark:bg-gray-800 p-6 rounded shadow">

            <h3 className="text-xl text-gray-900 dark:text-gray-200 mb-2">{group.name}</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">{group.description}</p>
            <Button onClick={()=>{
              navigate(`/groups/${group._id}`)
            }}>
              View
            </Button>
          </div>
     ) )}
  
      </div>


      {/* No Groups Message */}
      {/* <div className="no-groups flex flex-col items-center justify-center">
        <p className="text-xl text-gray-900 dark:text-gray-200 mb-4">You haven't joined any groups yet.</p>
        <button className="bg-blue-500 dark:bg-blue-300 text-white dark:text-gray-900 px-6 py-2 rounded">
          Explore Groups
        </button>
      </div> */}

      {/* Suggested Groups */}
      
    </div>
        </div>
        <div className="hidden md:block md:w-[25%] h-screen">
          <GroupRightSideBar/>

        </div>
      </div>}
      <FloatingActionButton/>
   </div>
  )
}

export default Groups
