import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import ProfileSideBar from "@/components/sections/ProfileSideBar";
import PostCard from "@/components/modules/Posts/PostCard";
import {
  Check,
  Mail,
} from "lucide-react";
import FloatingActionButton from "@/components/modules/FloatingActionButton";
import {Link, useNavigate} from 'react-router-dom'
import { formatNumber } from "@/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import MobileUserNavbar from "@/components/sections/MobileUserNavbar";
import FollowButton from "@/components/modules/FollowButton";
import { getUserPosts,getFollowers,getFollowing,getAccountsToFollow,getMyIndividualProjects,getCurrentUser } from '@/api/index'
import { PostInterface } from "@/types";
import DotLoader from "@/components/DotLoader";
import AddProjectModule from "@/components/modules/AddProjectModule";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow } from "date-fns";
import { FaGithub, FaProjectDiagram } from "react-icons/fa";
import parse from 'html-react-parser';
import axios from "axios";
import ComPostCard from "@/components/modules/ComPostCard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import OthersPostCard from '@/components/modules/Posts/OthersPostCard';
import { CategoryCard } from '@/components/modules/CategoryCard';


const Profile = () => {
  const navigate = useNavigate()
  const { user,setUser } = useAuth();
  const pathname = window.location.pathname;
  const [showPreview, setShowPreview] = useState(false);
  const [posts, setPosts] = useState([])
  // const [loading, setLoading] = useState(false)
  const [projects, setProjects] = useState([])
  const [followers, setFollowers] = useState([])
  const [following, setFollowing] = useState([])
  const [followLoading, setFollowLoading] = useState(false)
  const [accountsToFollow, setAccountsToFollow] = useState([])
  const [accountToFollowLoading, setAccountToFollowLoading] = useState(false)
  const [selectedTab, setSelectedTab] = useState("Posts");
  const scrollableDiv = useRef<HTMLDivElement|null>(null)
  const [postsLoading, setPostsLoading] = useState(false)
  const [communityPosts, setCommunityPosts] = useState([]);
  const [communityPostsLoading, setCommunityPostsLoading] = useState(false);
  const [showProfilePictureDialog, setShowProfilePictureDialog] = useState(false);
  const [hasUpdates, setHasUpdates] = useState(false);
  const [savedPosts, setSavedPosts] = useState<PostInterface[]>([]);
  const [savedPostsLoading, setSavedPostsLoading] = useState(false);
  const [likedPosts, setLikedPosts] = useState<PostInterface[]>([]);
  const [likedPostsLoading, setLikedPostsLoading] = useState(false);

  const [categories, setCategories] = useState<any[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [catPosts, setCatPosts] = useState<PostInterface[]>([]);
  const [catPostsLoading, setCatPostsLoading] = useState(false);


  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const response = await axios.get('/api/v1/categories?createdBy=' + user?._id);
      setCategories(response.data.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    if (selectedTab === 'Categories') {
      fetchCategories();
    }
  }, [selectedTab]);

  const fetchPostsForCategory = async (categoryName: string) => {
    setCatPostsLoading(true);
    try {
      const response = await axios.get(
        `/api/v1/posts/search?query=${encodeURIComponent(categoryName)}`
      );
      const filtered = response.data.data.posts.filter((post: PostInterface) => {
        const title = post.title.toLowerCase();
        const catLower = categoryName.toLowerCase();
        const titleMatches = title.includes(catLower) || title.includes("@" + catLower);
        // Ensure the post belongs to the logged in user
        const creatorMatches = post.createdBy?._id === user?._id;
        return titleMatches && creatorMatches;
      });
      setCatPosts(filtered);
    } catch (error) {
      console.error("Error fetching posts for category", error);
      setCatPosts([]);
    } finally {
      setCatPostsLoading(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  
  const getOwnFollowers = ()=>{
    if(followers[0]) return
    setFollowLoading(true)
    getFollowers({username:user?.username}).then(
      (res)=>{
        setFollowers(res.data.data)
        
        setFollowLoading(false)
      }
    )
  }
  const getOwnFollowing = ()=>{
    if(following[0]) return
    setFollowLoading(true)
    getFollowing({username:user?.username}).then(
      (res)=>{
        setFollowing(res.data.data)
        
        setFollowLoading(false)

      }
    )
  }
  const getAccountRecommendations = async()=>{
    if(accountsToFollow[0]) return
    setAccountToFollowLoading(true)
    const res = await getAccountsToFollow()
    setAccountsToFollow(res.data.data)
    setAccountToFollowLoading(false)
  }

  const getMyProjects = async()=>{
    const res = await getMyIndividualProjects()
    setProjects(res.data.data)
    
    
  }

  const getUserCommunityPosts = async () => {
    setCommunityPostsLoading(true);
    try {
      if (!user) {
        console.error("User is not available");
        return;
      }
      const response = await axios.get(
        `/api/v1/composts/user/${user._id}/community-posts`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setCommunityPosts(response.data);
    } catch (error) {
      console.error("Error fetching user community posts:", error);
    } finally {
      setCommunityPostsLoading(false);
    }
  };


  const linkify = (text: string | undefined) => {
    const pattern = /(https?:\/\/[^\s]+)|([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/g;
    if (!text) {
        return '';
      }
      return text.split(pattern).map((part, index) => {
        if (!part) return null; // Handle empty strings from splitting
        if (part.match(/^https?:\/\//)) {
          return (
            <a key={index} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
              {part}
            </a>
          );
        } else if (part.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+$/)) {
          const href = part.includes('@gmail.com') ? `https://mail.google.com/mail/?view=cm&fs=1&to=${part}` : `mailto:${part}`;
          return (
            <a key={index} href={href} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
              {part}
            </a>
          );
        } else {
          return part;
        }
      });
    };

function convertEmailToLink(text: string): string {
    // Regular expression to find URLs
    //const urlPattern = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
    // Regular expression to find email addresses
    const emailPattern = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;

    // Replace URLs with anchor tags
    //let replacedText = text.replace(urlPattern, '<a href="$1" target="_blank" class="text-blue-500 underline">$1</a>');
    // Replace email addresses with Gmail compose links
    let replacedText = text.replace(emailPattern, '<a href="https://mail.google.com/mail/?view=cm&fs=1&to=$1" target="_blank" >$1</a>');

    return replacedText;
}
  

  useEffect(()=>{
    document.title = "SocialHive- Profile"
    setPostsLoading(true)
    getUserPosts({username:user?.username!}).then((res)=>{
      setPosts(res.data.data)
    })
    .finally(()=>{
      setPostsLoading(false)
    })
    getAccountRecommendations()
    getCurrentUser().then((res)=>{
      setUser(res.data.data)
    })
    getMyProjects()
  },[])

    useEffect(() => {
    const fetchUpdates = async () => {
      try {
        if (user) {
          const response = await axios.get(`/api/v1/updates/${user._id}`);
          setHasUpdates(response.data.length > 0);
        }
      } catch (error) {
        console.error('Error fetching updates:', error);
      }
    };

    fetchUpdates();
    }, [user?._id]);
  
    const fetchSavedPosts = async () => {
      const response = await axios.get('/api/v1/posts/saved-posts');
      setSavedPosts(response.data.data);
      setSavedPostsLoading(false);
    };

    const fetchLikedPosts = async () => {
      setLikedPostsLoading(true);
      try {
        const response = await axios.get('/api/v1/posts/liked-posts', {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        });
        setLikedPosts(response.data.data);
      } catch (error) {
        console.error('Error fetching liked posts:', error);
      } finally {
        setLikedPostsLoading(false);
      }
    };

 
  return (
    <div>
      {user && (
        <div className="flex">
          <div className="hidden md:block md:w-1/3 border-0 border-r-[1px] h-screen">
            <ProfileSideBar />
          </div>
          <div ref={scrollableDiv} className="md:w-2/3 w-full overflow-y-scroll scrollbar-hide border-0 border-r-[1px] h-screen">
          
          <MobileUserNavbar scrollableDiv={scrollableDiv}/>
            <div className="flex border-0 border-b">
              <div
                className={`w-1/3 py-5 text-center cursor-pointer ${
                  pathname == "/profile"
                    ? "font-bold text-lg text- bg-muted border-0 border-b-4 border-blue-500"
                    : "hover:bg-slate-900 duration-200"
                }`}
              >
                Profile
              </div>
              <Link to='/editProfile' className="py-5 w-1/3 text-center cursor-pointer hover:bg-slate-300 dark:hover:bg-slate-900 duration-200">
                Edit Profile
              </Link>
              <Link
                to="/profile-analytics"
                className="py-5 w-1/3 text-center cursor-pointer hover:bg-slate-300 dark:hover:bg-slate-900 duration-200"
              >
                Analytics
              </Link>
            </div>
            <Dialog>
              <div className="m-3 mx-auto w-44 rounded-full h-44 ">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className={`border-[7px] rounded-full w-48 h-50 justify-center ${hasUpdates ? 'border-indigo-500' : 'border-none'} hover:border-indigo-600 hover:opacity-50 dark:hover:opacity-25 cursor-pointer shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-400`}>
                      <img
                        onMouseEnter={() => {
                          setShowPreview(true);
                          console.log(showPreview)
                        }}
                        onMouseLeave={() => {
                          setShowPreview(false);
                          console.log(showPreview)
                        }}
                        src={user.profilePicture}
                        className="mx-auto rounded-full border-[7px] w-44 h-44 border-muted hover:opacity-50 dark:hover:opacity-25 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        alt=""
                      />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="-mt-20">
                    <DropdownMenuItem onClick={() => setShowProfilePictureDialog(true)}>
                      View Profile Picture
                    </DropdownMenuItem>
                    {hasUpdates && (
                      <DropdownMenuItem onClick={() => {navigate(`/user/${user._id}/updates`);}}>
                        View Update
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
                <Dialog open={showProfilePictureDialog} onOpenChange={setShowProfilePictureDialog}>
                  <DialogContent className="bg-transparent border-0">
                    <img
                      src={user.profilePicture}
                      className="w-full h-full"
                      alt=""
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </Dialog>
            <div className="text-center font-bold text-lg mt-8">{user.username}</div>
            <div className="text-center text-muted-foreground flex justify-center gap-1 items-center"><Mail size={20}/>{parse(convertEmailToLink(user.email))}
            {user?.isEmailVerified && <Check xlinkTitle="Email Verified" size={20} className="text-green-500"/>}
            </div>

            <div className="flex justify-around">
              <Dialog onOpenChange={getOwnFollowers}>
                  <DialogTrigger>
              <div className="hover:underline cursor-pointer">{
                formatNumber(user.followers.length)+" "
              } Followers</div>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-0 max-w-[80vw] md:max-w-[35vw]">
                <DialogHeader>
                  <DialogTitle>Followers</DialogTitle>
                  <DialogDescription>
                    <div className="flex flex-col mt-3 gap-2  max-h-[70vh] overflow-y-auto">
                      {followLoading && <DotLoader/>}
                      {!followLoading && !followers[0] &&
                       <div className="text-center text-sm m-3 text-muted-foreground">No Followers yet</div>}
                      
                      {
                        followers[0] && followers.map((follower:any, index) => (
                          <div onClick={()=>{
                            navigate(`/user/${follower.username}`)
                            window.location.reload()
                            }} key={index} className="flex items-center gap-2 hover:bg-muted cursor-pointer p-2">
                            <img src={follower.profilePicture} className="w-10 h-10 rounded-full" alt="" />
                            <div className="flex flex-col">
                              <div className="font-bold">{follower.username}</div>
                              <div className="text-sm text-muted-foreground line-clamp-1">{follower.college}</div>
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
              </Dialog>
              <Dialog onOpenChange={getOwnFollowing}>
                  <DialogTrigger>
              <div className="hover:underline cursor-pointer">{
                formatNumber(user.following.length)+" "
              } Following</div>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-0 max-w-[80vw] md:max-w-[35vw]">
                <DialogHeader>
                  <DialogTitle>Following</DialogTitle>
                  <DialogDescription>
                    <div className="flex flex-col mt-3 gap-2  max-h-[70vh] overflow-y-auto">
                      {followLoading && <DotLoader/>}
                      {!followLoading && !following[0] &&
                       <div className="text-center text-sm m-3 text-muted-foreground">You are not following anyone yet</div>}

                      
                      {
                        following[0] && following.map((follow:any, index) => (
                          <div onClick={()=>{
                            navigate(`/user/${follow.username}`)
                            window.location.reload()
                            }} key={index} className="flex items-center gap-2 hover:bg-muted cursor-pointer p-2">
                            <img src={follow.profilePicture} className="w-10 h-10 rounded-full" alt="" />
                            <div className="flex flex-col">
                              <div className="font-bold">{follow.username}</div>
                              <div className="text-sm text-muted-foreground line-clamp-1">{follow.college}</div>
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
              </Dialog>
            </div>
           
            <div className="text-center mt-3 font-bold text-lg">Bio</div>
            <div className="text-center text-sm m-3 text-muted-foreground">
              {linkify(user.bio)}
            </div>
            <div className="w-full h-[2px] bg-muted"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 m-3 mx-5 gap-3">
              <div className="flex items-center gap-2">
                <div className="font-bold">College: </div>
                <div className="text-sm">
                  {user.college}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="font-bold">Graduation: </div>
                <div className="text-sm">{user.yearOfGraduation}</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="font-bold">Branch: </div>
                <div className="text-sm">{user.engineeringDomain}</div>
              </div>
            </div>
            <div className="w-full h-[2px] bg-muted mt-5"></div>
            <div className={`profile-tabs bg-gray-200 sticky top-0 duration-300 z-[9999] dark:bg-gray-700 text-gray-800 dark:text-gray-200 my-3`}>
        <ul className="flex justify-center md:gap-1">
          <li className={`cursor-pointer hover:text-blue-500 duration-150 p-3 md:px-2 m-2 ${
            selectedTab === "Posts" && "bg-muted  font-bold hover:text-gray-500"
          }`}
          onClick={() =>{
            if(selectedTab != "Posts") 
            setSelectedTab("Posts")
            else{
              scrollToTop()
            }
          }
          }
          >Posts</li>
          <li
            className={`cursor-pointer hover:text-blue-500 duration-150 p-3 md:px-2 m-2 ${
              selectedTab === "Community Posts" && "bg-muted font-bold hover:text-gray-500"
            }`}
            onClick={() => {
              if (selectedTab !== "Community Posts") {
                setSelectedTab("Community Posts");
                getUserCommunityPosts();
              } else {
                scrollToTop();
              }
            }}
          >
            Community Posts
          </li>
          <li
            className={`cursor-pointer hover:text-blue-500 duration-150 p-3 md:px-2 m-2 ${
              selectedTab === "Categories" && "bg-muted font-bold hover:text-gray-500"
            }`}
            onClick={() => {
              if (selectedTab !== "Categories") {
                setSelectedTab("Categories");
              } else {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
          >
            Categories
          </li>
          <li className={`cursor-pointer hover:text-blue-500 duration-150 p-3  md:px-2 m-2
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
          <li
            className={`cursor-pointer hover:text-blue-500 duration-150 p-3 md:px-2 m-2 ${
              selectedTab === "Saved Posts" && "bg-muted font-bold hover:text-gray-500"
            }`}
            onClick={() => {
              if (selectedTab !== "Saved Posts") {
                setSelectedTab("Saved Posts");
                fetchSavedPosts();
              } else {
                scrollToTop();
              }
            }}
          >
            Saved Posts
          </li>
          <li
            className={`cursor-pointer hover:text-blue-500 duration-150 p-3 md:px-2 m-2 ${
              selectedTab === "Liked Posts" && "bg-muted font-bold hover:text-gray-500"
            }`}
            onClick={() => {
              if (selectedTab !== "Liked Posts") {
                setSelectedTab("Liked Posts");
                fetchLikedPosts();
              } else {
                scrollToTop();
              }
            }}
          >
            Liked Posts
          </li>          
        </ul>
      </div>
      {selectedTab == "Posts" && <div className="posts">
        {
          posts.length == 0 &&
          <div className="text-center text-muted-foreground mt-3">No posts yet</div>
        }
        {postsLoading && !posts[0] && <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>}
      {
        posts.map((post:PostInterface, index) => {
          return(
            <>
              {post.isRepost && <div className='mx-10 w-fit bg-muted p-1 md:p-2 gap-1 text-sm md:text-md flex md:gap-3'>
                  Reposted by <Link className='flex  gap-1 md:gap-2 items-center' to={`/profile`}  onClick={()=>navigate(`/user/${user.username}/`)}>
                  <img src={user.profilePicture} className='w-6 h-6 rounded-full' alt="" />
                  <div>{user.username}</div>
                  <Separator className='bg-muted-foreground' orientation='vertical'/>
                  <div className="text-xs md:text-sm">{formatDistanceToNow(post.createdAt!, { addSuffix: true })}</div>
                  </Link>
              </div>}
          <PostCard refreshFunc={()=>{

            setPostsLoading(true)
            scrollToTop()
            getUserPosts({username:user?.username!}).then((res)=>{
              setPosts(res.data.data)
            }).finally(()=>{
              setPostsLoading(false)
            })
          }} key={index} postedUser={post.isRepost && post.repostedPost?.createdBy?post.repostedPost?.createdBy:user} post={post.isRepost && post.repostedPost?post.repostedPost:post}/>
            </>
        )
        })
      }
      </div>}
    {selectedTab === "Community Posts" && (
      <div className="community-posts">
        {communityPostsLoading && (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        )}
        {!communityPostsLoading && communityPosts.length === 0 && (
          <div className="text-center text-muted-foreground mt-3">
            No community posts yet
          </div>
        )}
          {communityPosts.map((post: any, index: number) => (
          <div className="pl-4 pr-4">
              <ComPostCard key={index} post={post} />
          </div>
        ))}
      </div>
      )}
      {selectedTab === "Saved Posts" && (
        <div className="saved-posts">
          {savedPostsLoading && (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
            </div>
          )}
          {!savedPostsLoading && Array.isArray(savedPosts) && savedPosts.length === 0 && (
            <div className="text-center text-muted-foreground mt-3">
              No saved posts yet
            </div>
          )}
          {!savedPostsLoading && Array.isArray(savedPosts) && savedPosts.map((post: any, index: number) => (
            <div key={index} className="pl-4 pr-4">
              <PostCard
                postedUser={post.createdBy}
                post={post}
                refreshFunc={fetchSavedPosts}
              />
            </div>
          ))}
        </div>
      )}
      {selectedTab === "Liked Posts" && (
        <div className="liked-posts">
          {likedPostsLoading && (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
            </div>
          )}
          {!likedPostsLoading && Array.isArray(likedPosts) && likedPosts.length === 0 && (
            <div className="text-center text-muted-foreground mt-3">
              No liked posts yet
            </div>
          )}
          {!likedPostsLoading && Array.isArray(likedPosts) && likedPosts
            .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()) // Sort by createdAt date
            .map((post: any, index: number) => (
              <div key={index} className="pl-4 pr-4">
                <OthersPostCard
                  otherUser={post.createdBy}
                  post={post}
                  followCallback={fetchLikedPosts}
                />
              </div>
            ))}
        </div>
            )}
        {selectedTab === "Categories" && (
          <>
            {selectedCategory ? (
              // Render the category posts view with back button and category name
              <div className="flex flex-col gap-2 mb-8">
                <div className="flex items-center px-6 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedCategory(null);
                      setCatPosts([]);
                    }}
                  >
                    Back
                  </Button>
                  <h2 className="ml-4 text-xl font-bold">Category: {selectedCategory}</h2>
                </div>
                {catPostsLoading ? (
                  <p className="text-center">Loading posts...</p>
                ) : catPosts.length === 0 ? (
                  <p className="text-center">No posts found in this category.</p>
                ) : (
                  // Map and display posts (using PostCard or your desired component)
                  catPosts.map((post: PostInterface, index: number) => (
                    <div key={post._id || index} className="mb-4">
                      {post.createdBy && (
                        <PostCard
                          post={post}
                          postedUser={post.createdBy}
                          refreshFunc={() => fetchPostsForCategory(selectedCategory!)}
                        />
                      )}
                    </div>
                  ))
                )}
              </div>
            ) : (
              // Render default view: the list of category cards
              <div className="p-4 flex flex-col gap-4 mb-8">
                {categoriesLoading ? (
                  <p className="text-center">Loading categories...</p>
                ) : categories.length === 0 ? (
                  <p className="text-center italic text-gray-400 text-sm">To add your posts to your category, just include <span className="text-orange-500 mr-1">@</span>followed by your existing category name in your <span className="underline">post's title.</span> <br/> ( for eg: <span className="text-orange-500">@categoryname</span> )</p>
                ) : (
                  categories.map((cat) => (
                    <CategoryCard
                      key={cat._id}
                      category={cat}
                      // When a category is clicked, setSelectedCategory gets updated and we fetch its posts.
                      onClick={() => {
                        setSelectedCategory(cat.name);
                        fetchPostsForCategory(cat.name);
                      }}
                    />
                  ))
                )}
              </div>
            )}
          </>
        )}
      {selectedTab === "Projects" && <div className="group-projects p-4">
          {/* Project Cards */}
          {projects.length == 0 && 
        <p className="text-center">No projects found</p>}
        
        <AddProjectModule type={'individual'} refreshFunc={getMyProjects}/>
        <div className="min-h-[70vh]">

          {projects
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
          </div>

          </div>}
            
          </div>
          <div className="hidden lg:block w-1/3 h-screen">
            <div className="text-xl font-semibold m-5 ml-2">Accounts to follow</div>

            <div className="relative flex border-y-[] flex-col  overflow-auto">
            <div className="absolute top-0 left-0 right-0 h-[60px] bg-gradient-to-b from-slate-200 dark:from-slate-800 to-transparent"></div>
              {!accountToFollowLoading && accountsToFollow.map(
                (user:any, index) => (
                <div key={index} className="accountCard flex items-center justify-between gap-1 p-3 h-20 w-[95%] mx-auto border-y-[1px]">
                <div className="flex items-center gap-1">
                    <div className="min-w-fit">
                      <img src={user.profilePicture} className="w-10  h-10 rounded-full " alt="" />
                    </div>
                    <div>

                    <Link  to={`/user/${user.username}`} className="font-semibold overflow-ellipsis hover:underline">
                      {user.username}
                    </Link>
                    <p className="text-xs text-muted-foreground">{user.college?.split('(')[1]?'('+user.college?.split('(')[1]:user.college}</p>
                    </div>
                </div>
                    <FollowButton userIdToFollow={user._id} className="h-3/4"/>
              </div>
              ) )}
            </div>
            
          </div>
        </div>
      )}
      <FloatingActionButton/>
    </div>
  );
};

export default Profile