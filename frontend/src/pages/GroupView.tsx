import { getGroupForVisitors, requestToJoinGroup } from "@/api/index"
import { useEffect, useRef, useState } from "react"
import { Link, useParams, useSearchParams } from "react-router-dom"
import PostSkeletonLoader from "@/components/modules/Posts/PostSkeletonLoader"
import { Button } from "@/components/ui/button"
import {
     AlertDialog, 
     AlertDialogTrigger,

     AlertDialogContent,
     AlertDialogHeader,
     AlertDialogTitle,
     AlertDialogDescription,
     AlertDialogFooter,
     AlertDialogCancel,
     AlertDialogAction,
   } from "@/components/ui/alert-dialog"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { FaGithub, FaProjectDiagram } from "react-icons/fa"
function GroupView() {
    const {user} = useAuth()
    
    const [group, setGroup] = useState<any>(null)
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [joinRequested, setJoinRequested] = useState(false)
    const [searchParams] = useSearchParams();

    const urlTab = searchParams.get("tab")
    const scroll = searchParams.get("scroll")
    const [selectedTab, setSelectedTab] = useState(urlTab || "Members")
    const scrollableDivRef = useRef<HTMLDivElement>(null);
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
    useEffect(()=>{
        scrollToTop()
        if(scroll == "true")
        {scrollableDivRef && 
        scrollableDivRef.current &&
        scrollableDivRef.current.scrollTo({
          top: 500,
          behavior: "instant",
        });}
    },[])
    
    const { groupId } = useParams()
    useEffect(() => {
        setLoading(true)
        setError(null)
        getGroupForVisitors({groupId}).then((res) => {
            setGroup(res.data.data)
            document.title = `SocialHive - ${res.data.data.name}`
            if(res.data.data.joinRequests.includes(user?._id)){
                setJoinRequested(true)
            }
        })
        .catch((err) => {
            if(err.status == 403){
                navigate(`/groups/${groupId}`)
            }else{
                setError(err.message)
            }
        })
        .finally(() => {
            setLoading(false)
        })
    }, [groupId])
  return (
    <div ref={scrollableDivRef} className="w-[85%] md:w-3/4 overflow-y-scroll scrollbar-hide border-0 border-r-[1px] h-screen">
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

  <div className="group-stats flex justify-center gap-4 mt-4 text-gray-700 dark:text-gray-300">
    <span>Members: {group.members.length}</span>
    <span>Posts: {group.posts.length}</span>
    <span>Projects: {group.projects.length}</span>
  </div>
      <div className="flex justify-center items-center gap-5">
    {joinRequested?
    <Button className="mt-6" disabled>Request Sent</Button>
    :<AlertDialog>
      <AlertDialogTrigger asChild>
        <Button className="mt-6">Send Group Request</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to join this group?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will send a request to the group admin to accept your request.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={()=>{
            requestToJoinGroup({groupId}).then(()=>{
              navigate('/groups')
            })
          }}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>}
    
    {/* </AlertDialog> */}
  
   

  
</div>
</div>

{/* Group Tabs */}
<div className="group-tabs bg-gray-200 sticky top-0 z-[9999] dark:bg-gray-700 text-gray-800 dark:text-gray-200">
  <ul className="flex justify-center md:gap-6">
    
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
    
  </ul>
</div>
{selectedTab === "Projects" && <div className="group-projects p-4">
  {/* Project Cards */}
  {group.projects.length == 0 && 
<p className="text-center">No projects found</p>}

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
    <span className="text-gray-500">{member.email}</span>
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
  
      </div>
      
    )}
  </div>
</div>
</div>
</div>
))}

</div>}

  </div>}
  </div>
  )
}

export default GroupView
