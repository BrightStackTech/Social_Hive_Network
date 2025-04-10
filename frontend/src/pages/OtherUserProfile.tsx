import {useState,useEffect, useRef} from 'react'
import ProfileSideBar from '@/components/sections/ProfileSideBar'
import { getUserProfile } from '@/api/index'
import { getUserPosts,getFollowers,getFollowing } from '@/api/index'
import { Link, useParams } from 'react-router-dom'
import Loader from '@/components/Loader'
import { PostInterface } from '@/types'
import { formatNumber } from '@/utils'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/AuthContext'
// import { ExternalLink } from "lucide-react";
import PostCard from '@/components/modules/Posts/OthersPostCard'
import FollowButton from '@/components/modules/FollowButton'
import { useNavigate } from 'react-router-dom'
import DotLoader from '@/components/DotLoader'
import { formatDistanceToNow } from 'date-fns'
import { Separator } from '@/components/ui/separator'
import MobileUserNavbar from '@/components/sections/MobileUserNavbar'
import { Button } from '@/components/ui/button'
import { getAccountsToFollow } from '@/api/index';
import axios from 'axios';
import ComPostCard from '../components/modules/ComPostCard';
import CategoryCard from "@/components/modules/CategoryCard";
import { toast } from "react-toastify";


function OtherUserProfile() {
    const navigate = useNavigate()
    const {username} = useParams()
    const [otherUser,setOtherUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [showPreview, setShowPreview] = useState(false);
    const [posts,setPosts] = useState<any>([])
    const {user, token} = useAuth()
    const [followers, setFollowers] = useState([])
    const [following, setFollowing] = useState([])
    const [followLoading,setFollowLoading] = useState(false)
    const scrollableDiv = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);
    const [accountsToFollow, setAccountsToFollow] = useState([]);
    const [accountToFollowLoading, setAccountToFollowLoading] = useState(false);
    const [selectedTab, setSelectedTab] = useState("Posts");
    const [communityPosts, setCommunityPosts] = useState([]);
    const [communityPostsLoading, setCommunityPostsLoading] = useState(false);
    const [showProfilePictureDialog, setShowProfilePictureDialog] = useState(false);
    const [hasUpdates, setHasUpdates] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
  const [catPosts, setCatPosts] = useState<PostInterface[]>([]);
  const [catPostsLoading, setCatPostsLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);



    const getAccountRecommendations = async()=>{
      if(accountsToFollow[0]) return
      setAccountToFollowLoading(true)
      const res = await getAccountsToFollow()
      setAccountsToFollow(res.data.data)
      setAccountToFollowLoading(false)
  }
  
    useEffect(() => {
      getAccountRecommendations();
    }, []);

    const handleFollowToggle = async () => {
      await fetchUserProfile();
      setIsFollowing(user?.following.includes(otherUser._id) ?? false);
    };
  
    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);
      const handleChatClick = async () => {
      if (!user) return;

      try {
        navigate(`/chat/${username}`);
      } catch (error) {
        console.error('Error creating or getting chat:', error);
      }
    };
    

    const getOtherFollowers = ()=>{
      if(followers[0]) return
      setFollowLoading(true)
      getFollowers({username:otherUser?.username}).then(
        (res)=>{
          setFollowers(res.data.data)
          setFollowLoading(false)
        }
      )
    }
    const getOtherFollowing = ()=>{
      if(following[0]) return
      setFollowLoading(true)
      getFollowing({username:otherUser?.username}).then(
        (res)=>{
          setFollowing(res.data.data)
          setFollowLoading(false)
        }

      )
    }
  const fetchUserProfile = async () => {
    if (user?.username === username) {
      navigate('/profile')
    }
    const response = await getUserProfile({ username });
    const fetchedUser = response.data.data.user; // New variable
    setOtherUser(fetchedUser);
    document.title = `SocialHive - ${fetchedUser.username}`;
    setFollowers([]);
    setFollowing([]);
    const postsResponse = await getUserPosts({ username: username || '' });
    setPosts(postsResponse.data.data);
    // Set isFollowing using the fetched user data instead of the stale state
    setIsFollowing(user?.following.includes(fetchedUser._id) ?? false);
  };

  // Fetch Categories list
  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_SERVER_URI}/categories?createdBy=${otherUser._id}`)
      setCategories(response.data.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Fetch posts for a given category
  const fetchPostsForCategory = async (categoryName: string) => {
    setCatPostsLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URI}/posts/search?query=${encodeURIComponent(categoryName)}`
      );
      const filtered = response.data.data.posts.filter((post: PostInterface) => {
        const title = post.title.toLowerCase();
        const catLower = categoryName.toLowerCase();
        const titleMatches = title.includes(catLower) || title.includes("@" + catLower);
        const creatorMatches = post.createdBy?._id === otherUser?._id;
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

  // On tab change, if Categories is selected, load categories list
  useEffect(() => {
    if (selectedTab === "Categories") {
      fetchCategories();
    }
  }, [selectedTab]);

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
  
  const getOtherUserCommunityPosts = async () => {
  if (!otherUser?._id || !user) return; // optional guard
  setCommunityPostsLoading(true);
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_SERVER_URI}/composts/user/${otherUser._id}/community-posts`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    setCommunityPosts(response.data);
  } catch (error) {
    console.error("Error fetching other user community posts:", error);
  } finally {
    setCommunityPostsLoading(false);
  }
};

    useEffect(() => {
      setLoading(true);
      fetchUserProfile().then(() => {
        setLoading(false);
      });
    }, [user, username]);

    useEffect(() => {
      const fetchUpdates = async () => {
        try {
          const response = await axios.get(`${import.meta.env.VITE_SERVER_URI}/updates/${otherUser._id}`);
          setHasUpdates(response.data.length > 0);
        } catch (error) {
          console.error('Error fetching updates:', error);
        }
      };

      if (otherUser) {
        fetchUpdates();
      }
    }, [otherUser]);
  
    const canChat = Boolean(
      user &&
      otherUser &&
      user.following?.includes(otherUser._id) &&
      otherUser.following?.includes(user._id)
    );

  return (
    <div>
        {loading && <Loader/>}
        { !loading && !otherUser && <div className='text-2xl font-semibold text-center'>User not found</div>}

        { !loading && otherUser && <div className='flex'>
        <div className="hidden md:block md:w-1/4 border-0 border-r-[1px] h-screen">
        <ProfileSideBar/>
        </div>
        <div ref={scrollableDiv} className="w-full md:w-[50%] overflow-y-scroll scrollbar-hide border-0 border-r-[1px] h-screen">
          <MobileUserNavbar scrollableDiv={scrollableDiv}/>
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
                      src={otherUser.profilePicture}
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
                    <DropdownMenuItem onClick={() => navigate(`/user/${otherUser._id}/updates`)}>
                      View Update
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              <Dialog open={showProfilePictureDialog} onOpenChange={setShowProfilePictureDialog}>
                <DialogContent className="bg-transparent border-0">
                  <img
                    src={otherUser.profilePicture}
                    className="w-full h-full"
                    alt=""
                  />
                </DialogContent>
              </Dialog>
            </div>
          </Dialog>
            <div className="text-center font-bold text-lg mt-8">{otherUser.username}</div>
            <div className="flex mt-4 justify-around">
            <Dialog onOpenChange={getOtherFollowers}>
                  <DialogTrigger>
              <div className="hover:underline cursor-pointer">{
                formatNumber(otherUser.followers.length)+" "
              } Followers</div>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-0 max-w-[80vw] md:max-w-[35vw]">
                <DialogHeader>
                  <DialogTitle>Followers</DialogTitle>
                  <DialogDescription>
                    <div className="flex flex-col mt-3 gap-2  max-h-[70vh] overflow-y-auto">
                      {followLoading && <DotLoader />}
                      {!followLoading && !followers[0] && 
                      <div className="text-center text-sm m-3 text-muted-foreground">
                        No one is following {otherUser.username} yet
                      </div>}
                      {
                        followers[0] && followers.map((follower:any, index) => (
                          <div onClick={()=>{
                            navigate(`/user/${follower.username}`)
                            window.location.reload()
                            }} key={index} className="flex cursor-pointer hover:bg-muted p-2 items-center gap-2">
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
                {user?.following.includes(otherUser._id) && (
                  <div>
                  <FollowButton className='' userIdToFollow={otherUser._id} callback={fetchUserProfile}/>
                  </div>
                )}
                {!user?.following.includes(otherUser._id) && (
                <div>
                <FollowButton className='' userIdToFollow={otherUser._id} callback={fetchUserProfile}/>
                </div>
                )}
                {isFollowing && (
                  <Dialog onOpenChange={getOtherFollowing}>
                    <Button
                      /* Example “dim” styling when canChat is false: */
                      className={`min-w-28 ${
                        !canChat ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      variant={isHovered ? 'default' : 'outline'}
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                      onClick={() => {
                        if (!canChat) {
                          // Show toast if they are not mutual followers
                          toast.error("Both users should follow each other in order to initiate a chat");
                          return;
                        }
                        // Otherwise proceed to chat
                        handleChatClick();
                      }}
                    >
                      Chat
                    </Button>
                    <DialogTrigger>
                      <div className="hover:underline cursor-pointer">
                        {formatNumber(otherUser.following.length) + " "} Following
                      </div>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-900 border-0 max-w-[80vw] md:max-w-[35vw]">
                      <DialogHeader>
                        <DialogTitle>Following</DialogTitle>
                        <DialogDescription>
                          <div className="flex flex-col mt-3 gap-2 max-h-[70vh] overflow-y-auto">
                            {followLoading && <DotLoader />}
                            {!followLoading && !following[0] && (
                              <div className="text-center text-sm m-3 text-muted-foreground">
                                {otherUser.username} is not following anyone yet
                              </div>
                            )}
                            {following[0] && following.map((follow: any, index) => (
                              <div
                                onClick={() => {
                                  navigate(`/user/${follow.username}`);
                                  window.location.reload();
                                }}
                                key={index}
                                className="flex cursor-pointer hover:bg-muted p-2 items-center gap-2"
                              >
                                <img src={follow.profilePicture} className="w-10 h-10 rounded-full" alt="" />
                                <div className="flex flex-col">
                                  <div className="font-bold">{follow.username}</div>
                                  <div className="text-sm text-muted-foreground line-clamp-1">{follow.college}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </DialogDescription>
                      </DialogHeader>
                    </DialogContent>
                  </Dialog>
                )}
            </div>
            <div className="text-center mt-3 font-bold text-lg">Bio</div>
            <div className="text-center text-sm m-3 text-muted-foreground">
              {linkify(otherUser.bio)}
            </div>
            <div className="w-full h-[2px] bg-muted"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 m-3 mx-5 gap-3">
              <div className="flex items-center gap-2">
                <div className="font-bold">College: </div>
                <div className="text-sm">
                  {otherUser.college}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="font-bold">Graduation: </div>
                <div className="text-sm">{otherUser.yearOfGraduation}</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="font-bold">Branch: </div>
                <div className="text-sm">{otherUser.engineeringDomain}</div>
              </div>
            </div>
            <div className="w-full h-[2px] bg-muted mt-5"></div>
            <div className="posts">
              <div className="profile-tabs bg-gray-200 sticky top-0 duration-300 z-[9999] dark:bg-gray-700 text-gray-800 dark:text-gray-200 my-3">
                <ul className="flex justify-center md:gap-6">
                  <li
                    className={`cursor-pointer hover:text-blue-500 duration-150 p-2 md:px-4 m-2 ${
                      selectedTab === "Posts" && "bg-muted font-bold hover:text-gray-500"
                    }`}
                    onClick={() => {
                      if (selectedTab !== "Posts") setSelectedTab("Posts");
                      else scrollTo();
                    }}
                  >
                    Posts
                  </li>
                  <li
                    className={`cursor-pointer hover:text-blue-500 duration-150 p-2 md:px-4 m-2 ${
                      selectedTab === "Community Posts" && "bg-muted font-bold hover:text-gray-500"
                    }`}
                    onClick={() => {
                      if (selectedTab !== "Community Posts") {
                        setSelectedTab("Community Posts");
                        getOtherUserCommunityPosts();
                      } else {
                        scrollTo();
                      }
                    }}
                  >
                    Community Posts
                </li>
                <li
                  className={`cursor-pointer hover:text-blue-500 duration-150 p-2 md:px-4 m-2 ${
                    selectedTab === "Categories" && "bg-muted font-bold hover:text-gray-500"
                  }`}
                  onClick={() =>
                    selectedTab !== "Categories" ? setSelectedTab("Categories") : window.scrollTo({ top: 0, behavior: "smooth" })
                  }
                >
                  Categories
                </li>
                </ul>
              </div>
            {selectedTab === "Posts" && (
              <>
                {posts.length === 0 && (
                  <div className="text-center mt-7 text-gray-400">User hasn't posted any post yet</div>
                )}
                {posts.map((post: PostInterface, index: any) => {
                  return (
                    <>
                      {post.isRepost && (
                        <div
                          key={post._id}
                          className="mx-10 w-fit bg-muted p-1 md:p-2 gap-1 text-sm md:text-md flex md:gap-3"
                        >
                          Reposted by{" "}
                          <Link
                            className="flex gap-1 md:gap-2 items-center"
                            to={`/user/${otherUser.username}`}
                            onClick={() => navigate(`/user/${otherUser.username}/`)}
                          >
                            <img
                              src={otherUser.profilePicture}
                              className="w-6 h-6 rounded-full"
                              alt=""
                            />
                            <div>{otherUser.username}</div>
                            <Separator
                              className="bg-muted-foreground"
                              orientation="vertical"
                            />
                            <div className="text-xs md:text-sm">
                              {formatDistanceToNow(post.createdAt!, {
                                addSuffix: true,
                              })}
                            </div>
                          </Link>
                        </div>
                      )}
                      <PostCard
                        key={index}
                        otherUser={
                          post.isRepost ? post.repostedPost?.createdBy : otherUser
                        }
                        post={post.isRepost ? post.repostedPost : post}
                        followCallback={fetchUserProfile}
                      />
                    </>
                  );
                })}
              </>
            )}

            {selectedTab === "Community Posts" && (
              <div className="community-posts min-h-[70vh]">
                {communityPostsLoading && (
                  <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
                  </div>
                )}
                {!communityPostsLoading && communityPosts.length === 0 && (
                  <div className="text-center text-muted-foreground mt-7">
                    User hasn't posted any community post yet
                  </div>
                )}
                {communityPosts.map((post: any, index: number) => (
                  <div className="pl-4 pr-4">
                    <ComPostCard key={post._id || index} post={post} />
                  </div>
                ))}
              </div>
            )}
       {selectedTab === "Categories" && (
              <>
                {selectedCategory ? (
                  // Render category posts view (back button and posts list)
                  <div className="flex flex-col gap-2 mb-8 min-h-[70vh]">
                    <div className="flex items-center px-6 mt-6">
                      <button
                        className="px-4 py-2 border rounded"
                        onClick={() => {
                          setSelectedCategory(null);
                          setCatPosts([]);
                        }}
                      >
                        Back
                      </button>
                      <h2 className="ml-4 text-xl font-bold">Category: {selectedCategory}</h2>
                    </div>
                    {catPostsLoading ? (
                      <p className="text-center">Loading posts...</p>
                    ) : catPosts.length === 0 ? (
                      <p className="text-center">No posts found in this category.</p>
                    ) : (
                      catPosts.map((post: PostInterface, index: number) => (
                        <div key={post._id || index} className="mb-4">
                          {post.createdBy && (
                            <PostCard
                              post={post}
                              otherUser={post.createdBy}
                            />
                          )}
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  // Render list of category cards
                  <div className="p-4 flex flex-col gap-4 mb-8 min-h-[70vh]">
                    {categoriesLoading ? (
                      <p className="text-center">Loading categories...</p>
                    ) : categories.length === 0 ? (
                      <p className="text-center text-gray-400">User hasn't created any category yet</p>
                    ) : (
                      categories.map((cat) => (
                        <CategoryCard
                          key={cat._id}
                          category={cat}
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
            </div>
        </div>
          <div className="hidden lg:block w-1/4 h-screen">
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
                    <FollowButton userIdToFollow={user._id} className="h-3/4" callback={handleFollowToggle}/>
              </div>
              ) )}
            </div>
            
          </div>
        
        </div>
        
        }
      
    </div>
  )
}

export default OtherUserProfile
