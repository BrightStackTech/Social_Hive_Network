import { useEffect, useState, useRef } from "react"
import ProfileSideBar from "@/components/sections/ProfileSideBar"
import { useAuth, UserInterface } from "@/context/AuthContext"
import {acceptRequest, deleteGroup, getGroup,removeFromGroup,getGroupSuggestedPeople, addToGroup,exitFromGroup, rejectRequest, getFollowers, getFollowing} from '@/api/index'
import { Link, useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
// import GroupAnnouncements from "../components/sections/GroupAnnouncements";
import PostSkeletonLoader from "@/components/modules/Posts/PostSkeletonLoader";
import { Check, Copy, X } from "lucide-react";
import AddProjectModule from "@/components/modules/AddProjectModule";
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
 } from "@/components/ui/alert-dialog";
import { toast } from "react-toastify";
import {RWebShare} from 'react-web-share'
import GroupSettings from "@/components/sections/GroupSettings";
import MobileUserNavbar from "@/components/sections/MobileUserNavbar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { FaGithub, FaProjectDiagram } from "react-icons/fa";

function GroupIdPage() {
    const {groupId} = useParams()
    const navigate = useNavigate()
    const { user } = useAuth();
    const [searchParams] = useSearchParams();

    const urlTab = searchParams.get("tab")
    const scroll = searchParams.get("scroll")

    const [group, setGroup] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
  // const [selectedTab, setSelectedTab] = useState(urlTab || "Projects");
    const [selectedTab, setSelectedTab] = useState(urlTab || "Members");
    const [admin, setAdmin] = useState(false);
    const [joinRequests,setJoinRequests] = useState([]);
    const [suggestedPeople, setSuggestedPeople] = useState([])
    const [followers, setFollowers] = useState([])
    const [following, setFollowing] = useState([])
    const [membersToAdd, setMembersToAdd] = useState<any>([])
    const scrollableDivRef = useRef<HTMLDivElement>(null);
    const [addMembersDialogOpen, setAddMembersDialogOpen] = useState(false)
  const [addMembersQuery, setAddMembersQuery] = useState("")
    const [isHovered, setIsHovered] = useState(false);
  
  
  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);
    const handleChatClick = async () => {
    if (!user) return;

    try {
      navigate(`/chat/${group.name}`);
    } catch (error) {
      console.error('Error creating or getting chat:', error);
    }
  };
  
    const scrollToTop = ()=>{
        if(scrollableDivRef.current){
            scrollableDivRef.current.scrollTo(
              {
                
                top:0,
                behavior:"smooth"
              }
            )
        }
    }

    const fetchGroup = async () => {
      setLoading(true);
      setGroup(null);
      try {
          const data = await getGroup({groupId});
          const grp = data.data.data
          const members = data.data.data.members
          document.title = `SocialHive - ${grp.name}`
          if(members.find((member:any) => member._id === user?._id))
            {
              setGroup(data.data.data);
              }else{
                  
            }
            if(user?._id == grp.admin._id){
              setAdmin(true)
              setJoinRequests(grp.joinRequests)
              setFollowers((await getFollowers({username:user?.username})).data.data)
              setFollowing((await getFollowing({username:user?.username})).data.data)
            }
            else{
              setAdmin(false)

            }             
      } catch (err:any) {
          if(err.status == 403){
           navigate(`/groupview/${groupId}`)
            
          }
          setError(err.message);
      } finally {
          setLoading(false);
      }
  };
  const fetchSuggestedPeople = async () => {
    if(admin)
    {
      const suggestedPeopleRes = await getGroupSuggestedPeople({groupId})

    if(suggestedPeopleRes.status == 200){
      setSuggestedPeople(suggestedPeopleRes.data.data)}
    }
    
};
    useEffect(() => {
        fetchGroup();
        if(scroll == "true")
        {scrollableDivRef && 
        scrollableDivRef.current &&
        scrollableDivRef.current.scrollTo({
          top: 500,
          behavior: "instant",
        });}
        
        
    }, [groupId, scrollableDivRef.current]);
    useEffect(()=>{
      fetchSuggestedPeople()
    },[admin])
    useEffect(()=>{
      setMembersToAdd(
        followers.filter((follower: any) =>
          following.some((followingUser: any) => followingUser._id === follower._id) &&
          !group.members.some((member: any) => member._id === follower._id)
        )
      );
      
      
    },[admin, followers, following])
  return (
   <div>
      {user && <div className='flex'>
        <div className="hidden md:block md:w-1/4 border-0 border-r-[1px] h-screen">
        <ProfileSideBar/>
        </div>
        <div ref={scrollableDivRef} className="w-full md:w-[50%] overflow-y-scroll scrollbar-hide border-0 border-r-[1px] h-screen">
          <MobileUserNavbar scrollableDiv={scrollableDivRef}/>
          {loading && <div>
            <PostSkeletonLoader/>
            <PostSkeletonLoader/>
            <PostSkeletonLoader/>
            </div>}
            {error && <div>Error: {error}</div>}
          {group &&  <div className="min-h-screen">
      {/* Group Header */}
      <div className="group-header bg--100 dark:bg--800 text-center p-4">
        
        <h1 className="text-4xl mt-4 font-bold text-gray-900 dark:text-gray-200">{group.name}</h1>
        <p className="text-gray-600 mt-1 dark:text-gray-400">{group.description}</p>
        <p className="text-gray-600 text-sm mt-1 dark:text-gray-400">Group id: {group._id} <Copy onClick={()=>{
          navigator.clipboard.writeText(group._id).then(()=>toast.success("Group Id copied to clipboard"))
        }} size={15} className="inline ml-1 cursor-pointer"/></p>

        <div className="group-stats flex justify-center gap-4 mt-4 text-gray-700 dark:text-gray-300">
          <span>Members: {group.members.length}</span>
          {/* <span>Posts: {group.posts.length}</span> */}
          <span>Projects: {group.projects.length}</span>
        </div>
            <div className="grid grid-cols-2 md:flex justify-center items-center gap-5">
          
          <AlertDialog>
            <AlertDialogTrigger >
        <Button variant={"destructive"} className="mt-6">    
          Leave Group
        </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure you want to leave this group?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={()=>{
                  exitFromGroup({groupId}).then(()=>{
                    navigate('/groups')
                  }).then(()=>{
                    toast.success("Successfully left the group")
                
                  })
                }}>Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
         
          {/* </AlertDialog> */}
        {admin && <div>
          {/*Delete Group */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant={"destructive"} className="mt-6 ml-2">
                Delete Group
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the group and all its data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={()=>{
                  deleteGroup({groupId}).then(()=>{
                    navigate('/groups')
                  })

                
                }}>Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          </div>}
          <RWebShare

            data={{
              text:  `
              Check out this group: ${group.name}`,
              url: `${window.location.origin}/groups/${group._id}`,
              title: "Share Group",

            }}

          >
            <Button variant={"default"} className="w-fit mx-auto md:w-auto md:mt-6 md:ml-2 md:mr-2">
              Share Group
            </Button>
          </RWebShare>
         {admin && <div>
            <Dialog open={addMembersDialogOpen} onOpenChange={setAddMembersDialogOpen}>
            <DialogTrigger>

            <Button variant={"outline"} className="md:mt-6">Add Members</Button>
            </DialogTrigger>

            <DialogContent>
               <DialogHeader>
                 <DialogTitle>Add Members to {group.name}</DialogTitle>
                 <DialogDescription>You should be following the member and they should be following you to add them to the group</DialogDescription>
               </DialogHeader>
               <Input placeholder="Search..." value={addMembersQuery} onChange={(e)=>setAddMembersQuery(e.target.value)}/>
               <div className="flex flex-col gap-4 max-h-[40vh] overflow-auto justify-between items-center">
               {membersToAdd.filter((member:UserInterface)=>member.username.toLowerCase().includes(addMembersQuery.toLowerCase())).map((member:UserInterface)=>(
                 <div className="flex justify-between w-[95%] items-center">
                   <div className="flex gap-2 justify-between items-center">
                   <img src={member.profilePicture} className="w-10 h-10 rounded-full"/>
                   <span>{member.username}</span>
                   </div>
                   <Button onClick={()=>{
                     addToGroup({groupId,userId:member._id}).then(()=>{
                       toast.success("Successfully added member to group")
                       setAddMembersDialogOpen(false)
                     })
                   }}
                   >Add</Button>
                 </div>
               ))}
               </div>

            </DialogContent>
            </Dialog>
          </div>}

              <Button
                  variant={isHovered ? 'default' : 'outline'}
                  className="mt-6 ml-2"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  onClick={handleChatClick}
              >Chat</Button>

        
            </div>
      </div>

      {/* Group Tabs */}
      <div className="group-tabs bg-gray-200 sticky top-0 z-[9999] dark:bg-gray-700 text-gray-800 dark:text-gray-200">
        <ul className="md:flex grid grid-cols-2 justify-center md:gap-6">
          {/* <li className={`cursor-pointer hover:text-blue-500 duration-150 p-2 md:px-4 m-2 ${
            selectedTab === "Announcements" && "bg-muted  font-bold hover:text-gray-500"
          }`}
          onClick={() =>{
            if(selectedTab != "Announcements") 
            setSelectedTab("Announcements")
            else{
              scrollToTop()
            }
          }
          }
          >Announcements</li> */}
          <li className={`cursor-pointer hover:text-blue-500 duration-150  p-2  md:px-4 m-2
            ${selectedTab === "Members" && "bg-muted hover:text-gray-500 font-bold"}
          `}
          onClick={()=>{
            if(selectedTab != "Members") 
              setSelectedTab("Members")
              else{
                scrollToTop()
              }
          }}
          >Members</li>
          <li className={`cursor-pointer hover:text-blue-500 duration-150 p-2  md:px-4 m-2
            ${selectedTab === "Projects" && "bg-muted hover:text-gray-500 font-bold"}
          `}
          onClick={()=>{
            if(selectedTab != "Projects") 
              setSelectedTab("Projects")
              else{
                scrollToTop()
              }
          }}
          >Projects</li>
          {(group.admin._id == user._id) && <li className={`cursor-pointer hover:text-blue-500 duration-150 p-2  md:px-4 m-2
            ${selectedTab === "Settings" && "bg-muted hover:text-gray-500 font-bold"}
          `}
          onClick={()=>{
            setSelectedTab("Settings")
          }}
          >Settings</li>}
          {(group.admin._id == user._id) && <li className={`cursor-pointer hover:text-blue-500 duration-150 p-2  md:px-4 m-2
            ${selectedTab === "Join Requests" && "bg-muted hover:text-gray-500 font-bold"}
          `}
          onClick={()=>{
            setSelectedTab("Join Requests")
          }}
          >Join Requests {joinRequests.length > 0 && <span className="rounded-full inline-flex w-6 items-center justify-center bg-gray-500">{joinRequests.length}</span>}</li>}
        </ul>
      </div>
      {/* {selectedTab === "Announcements" && <GroupAnnouncements/>} */}
      {selectedTab === "Projects" && <div className="group-projects p-4">
        {/* Project Cards */}
        {group.projects.length == 0 && 
      <p className="text-center">No projects found</p>}
      {admin && 
      <AddProjectModule type="group" groupId={group._id} refreshFunc={fetchGroup}/>
      } 
        {group.projects
          .map((project:any) => (
            <div key={project._id} className="bg-muted p-4 m-2">
              <div className="flex items-center justify-between">
                <div>

              <h2 className="
              text-xl font-semibold my-1
              ">{project.title}</h2>
              <p className="my-2">{project.description}</p>
              </div>
              <div>
                <div className="flex justify-end">
                {project.status == 'active' &&<span className="text-green-500 px-2 py-1 rounded-full">Active</span>}
                {project.status == 'completed' &&<span className="text-blue-500 px-2 py-1 rounded-full">Completed</span>}
                {project.status == 'pending' &&<span className="text-yellow-500 px-2 py-1 rounded-full">Pending</span>}<br/>
                </div>
                <Button className="my-2"
                onClick={()=>{
                  navigate(`/projects/${project._id}`)
                }}
                >View Project</Button>
              </div>
              </div>
              <div className="flex justify-around items-center">
                {project.githubLink && 
                <div className="flex items-center">
                  
                <FaGithub className="w-6 h-6 mr-2"/>
                <a href={project.githubLink} target="_blank" className="text-blue-500 hover:underline">GitHub</a>
                </div>
                }
                {project.projectLink &&
                <div className="flex items-center">
                <FaProjectDiagram className="w-6 h-6 mr-2"/>
                <a href={project.projectLink} target="_blank" className="text-blue-500 hover:underline">Live</a>
                </div>
                }
              
              </div>
            </div>
          ))}
      </div>}
     {selectedTab === "Members" && <div className="group-members p-4">
        {group.members.map((member:any) => (
  <div key={member._id} className="bg-muted p-4 m-2 cursor-pointer">
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <img
          src={member.profilePicture}
          alt={member.username}
          className="w-12 h-12 rounded-full mr-4"
        />
        <div>
          <Link to={`/user/${member.username}`} className="text-xl hover:underline block font-semibold my-1">{member.username}</Link>

          <span className="text-gray-500 block text-sm">
            ({member.engineeringDomain.split('(')[1]} in ({member.college.split('(')[1]}
          </span>
        </div>
      </div>
      <div>
        <div className="flex justify-end">
          {member._id === group.admin._id && (
            <span className="text-green-500 px-2 py-1 rounded-full">Admin</span>
          )}
          {member._id !== group.admin._id && (
            <div>
              
            <span className="text-blue-500 px-2 py-1 rounded-full">Member</span>
            <br/>
          {  admin &&
            <Button className="my-1" 
            onClick={()=>{removeFromGroup({userId:member._id, groupId:group._id})
            .then(()=>{
              fetchGroup()
            })
            
           }} variant={"destructive"}>Remove</Button>}
            </div>
            
          )}
        </div>
      </div>
    </div>
  </div>
))}

      </div>}
      {selectedTab === "Settings" && <div className="group-settings p-4">
        {/* Settings Form */}
        <GroupSettings group={group} refreshFunc={fetchGroup}/>
      </div>}
      {selectedTab === "Join Requests" && <div className="group-settings p-4">
        {/* Settings Form */}
        {admin &&
        <div className="min-h-[40vh] max-h-[40vh] overflow-y-auto"> 
        <div className="m-3 text-lg font-bold">
          </div>
          {joinRequests.length == 0 &&
          <p className="text-center">No join requests</p>
          }
          {
            joinRequests.map(
              (request:any)=>{
                return(
                  <div className="bg-muted p-2 m-2 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <img
                          src={request.profilePicture}
                          alt={request.username}
                          className="w-5 h-5 rounded-full mr-2"
                        />
                        <div>
                          <Link to={`/user/${request.username}`} className=" hover:underline block font-semibold my-1">{request.username}</Link>
                          <span className="text-sm text-gray-500">{request.email}</span>
                        </div>
                      </div>
                      <div>
                        <div className="flex gap-2 justify-end">
                          <Button
                           onClick={()=>{acceptRequest({userId:request._id,groupId:group._id})
                           .then(()=>{
                            fetchGroup()
                           })
                          }}
                           className="my-2">
                            <Check/>
                          </Button>
                          <Button className="my-2" variant={"destructive"}
                             onClick={()=>{
                              rejectRequest({userId:request._id, groupId:group._id})
                              .then(()=>{
                                
                                fetchGroup()
                              })
                            }}>
                            
                            <X/>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
            )
          }
          </div>

          }
      </div>}

    </div>}
        </div>
        <div className="md:w-[25%] hidden md:block  h-screen">
       
          {admin && <div>
            <div className="m-3  text-lg font-bold">
          Suggested Members

          </div>
            <div className="max-h-[40vh] overflow-y-auto">

          {suggestedPeople.length == 0 &&
          <p className="text-center">No suggested members</p>
          }
          {
            suggestedPeople.map(
              (person:any)=>{
                return(
                  <div key={person._id} className="bg-muted p-2 m-2 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <img
                          src={person.profilePicture}
                          alt={person.username}
                          className="w-5 h-5 rounded-full mr-2"
                        />
                        <div>
                          <Link to={`/user/${person.username}`} className=" hover:underline block font-semibold my-1">{person.username}</Link>
                          <span className="text-sm text-gray-500">{person.email.length>15?person.email.substring(0,15)+"...":person.email}</span>
                        </div>
                      </div>
                      <div>
                        <div className="flex gap-2 justify-end">
                          <Button
                           onClick={()=>{addToGroup({userId:person._id, groupId:group._id})
                           .then(()=>{
                            fetchGroup()
                            fetchSuggestedPeople()
                           })
                          }}
                           className="my-2">
                            <Check/>
                          </Button>
                          <Button className="my-2" variant={"destructive"}
                       
                          >
                            
                            <X/>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
            )
          }
                      </div>

        </div>}
   </div>
    </div>}
    </div>
  )
}

export default GroupIdPage
