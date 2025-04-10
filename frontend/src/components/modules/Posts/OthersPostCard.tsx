import {useState, useEffect} from 'react'
import {Globe, ThumbsUpIcon, MessageSquare, Repeat2}  from 'lucide-react'
import { UserInterface } from '@/context/AuthContext'
import FollowButton from '../FollowButton'
import { useNavigate } from 'react-router-dom'
import { createRepost, likePost, getUserGroups } from '@/api/index'
import { useAuth } from '@/context/AuthContext'
import { formatDistanceToNow } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
// import { Check, ExternalLink, Mail } from "lucide-react";
import { toast } from 'react-toastify'
import { FaLinkedin, FaReddit, FaFacebook, FaFacebookMessenger, FaRegBookmark } from 'react-icons/fa'
import { FaSquareXTwitter } from 'react-icons/fa6'
import { GoLink } from 'react-icons/go'
import { IoIosMail } from 'react-icons/io'
import { PiThreadsLogoFill } from 'react-icons/pi'
import { RiShare2Line, RiWhatsappFill, RiInstagramFill } from 'react-icons/ri'
// import { PostInterface } from '@/types'
import { Button } from '@/components/ui/button';
import { BsChatTextFill } from 'react-icons/bs';
import axios from 'axios';

const PostCard = ({otherUser, post, followCallback }:{otherUser:UserInterface|undefined;post:any;
  followCallback?: () => void
}) => {
   const navigate = useNavigate()
   const [readMore, setReadMore] = useState(false)
   const { user, token } = useAuth();
    const postCreationTime = new Date(post.createdAt)
    const [likes, setLikes] = useState(post.likes.length)
    const [comments, _] = useState(post.comments.length)
    const [reposts, setReposts] = useState(post.repostedBy?.length || 0)
    const [liked, setLiked] = useState(post.likes.includes(user?._id))
    const [reposted, setReposted] = useState(post.repostedBy?.includes(user?._id))
    const [likeLoading, setLikeLoading] = useState(false)
  const [repostLoading, setRepostLoading] = useState(false)
    const [isSaved, setIsSaved] = useState<boolean>(
      Array.isArray(post.savedBy) ? post.savedBy.includes(user?._id) : false
    );
  // const [openChatShareDialog, setOpenChatShareDialog] = useState(false);
  const [chatSearch, setChatSearch] = useState("");
  const [followers, setFollowers] = useState<Array<{ _id: string; username: string; profilePicture: string; bio: string }>>([]);
  const [groups, setGroups] = useState<Array<{ _id: string; name: string; description: string; profilePicture: string }>>([]);
  const [userCategories, setUserCategories] = useState<Array<{ id: string; name: string }>>([])

  useEffect(() => {
    if (otherUser?._id && token) {
      axios
        .get(`${import.meta.env.VITE_SERVER_URI}/categories?createdBy=${otherUser._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          const cats = res.data.data.map((cat: any) => ({
            id: cat._id,
            name: cat.name.toLowerCase(),
          }))
          setUserCategories(cats)
        })
        .catch((err) => {
          console.error('Error fetching user categories', err)
        })
    }
  }, [otherUser, token])


  const handleLike = async () => {
       try {
        if(likeLoading) return
        setLikeLoading(true)
        const res = await likePost({postId:post._id})
        setLikes(res.data.data)
        setLiked(!liked)
        setLikeLoading(false)
       } catch (error) {
        
       }
    }

    const handleRepost = async()=>{
      if(repostLoading) return
      setRepostLoading(true)
    const res = await createRepost({postId:post._id})
      setReposts(res.data.data.repostLength)
      setReposted(!reposted)
      setRepostLoading(false)
  }
  
  const convertToHyperlink = (text: string) => {
    const pattern =
      /(https?:\/\/[^\s]+)|([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)|(@[a-zA-Z0-9_]+)/g

    return text.split(pattern).map((part, index) => {
      if (!part) return null

      if (part.match(/^https?:\/\//)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            {part}
          </a>
        )
      } else if (
        part.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+$/)
      ) {
        const isGmail = part.toLowerCase().includes('@gmail.com')
        const href = isGmail
          ? `https://mail.google.com/mail/?view=cm&fs=1&to=${part}`
          : `mailto:${part}`
        const emailClass = isGmail
          ? 'text-blue-500 underline'
          : 'text-orange-500 underline'
        return (
          <a
            key={index}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={emailClass}
          >
            {part}
          </a>
        )
      } else if (part.match(/^@[a-zA-Z0-9_]+$/)) {
        // Remove the "@" for matching
        const handleName = part.slice(1).toLowerCase()
        const foundCategory = userCategories.find((cat) => cat.name === handleName)
        if (foundCategory) {
          return (
            <a
              key={index}
              onClick={() => navigate(`/category/${foundCategory.id}`)}
              className="text-orange-500 cursor-pointer"
            >
              {part}
            </a>
          )
        } else {
          return (
            <span
              key={index}
              onClick={() => navigate(`/post/${post._id}`)}
              className="cursor-pointer"
            >
              {part}
            </span>
          )
        }
      } else {
        // For any remaining normal text, navigate to the post page
        return (
          <span
            key={index}
            onClick={() => navigate(`/post/${post._id}`)}
            className="cursor-pointer"
          >
            {part}
          </span>
        )
      }
    })
  }
  
function convertUrlsToLinks(text: string): string {
    // Regular expression to find URLs
    const urlPattern = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
    // Regular expression to find email addresses
    const emailPattern = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;

    // Replace URLs with anchor tags
    let replacedText = text.replace(urlPattern, '<a href="$1" target="_blank" class="text-blue-500 underline">$1</a>');
    // Replace email addresses with Gmail compose links
    replacedText = replacedText.replace(emailPattern, '<a href="https://mail.google.com/mail/?view=cm&fs=1&to=$1" target="_blank"  class="text-blue-500 underline">$1</a>');

    return replacedText;
  }
  
    // New function: handleSharePost calls the share route directly using fetch
    const handleSharePost = async () => {
      try {
        if (otherUser?._id === user?._id) return;
        const response = await fetch(`${import.meta.env.VITE_SERVER_URI}/posts/${post._id}/share`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Assuming token is available from context, adjust header name if needed.
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          // toast.success("Post shared successfully", { theme: "colored" });
        } else {
          const errorData = await response.json();
          toast.error(errorData.message || "Something went wrong.", {
            theme: "colored",
          });
        }
      } catch (error) {
        toast.error("Something went wrong. Please try again later.", {
          theme: "colored",
        });
      }
    };
  
    // New function: handleSavePost calls the save route directly using fetch
    const handleSavePost = async () => {
      try {
        if (otherUser?._id === user?._id) return;
        // if not saved, then save the post using POST /:postId/save
        if (!isSaved) {
          const response = await fetch(`${import.meta.env.VITE_SERVER_URI}/posts/${post._id}/save`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });
          if (response.ok) {
            // update local state to mark as saved (icon turns blue)
            setIsSaved(true);
          } else {
            console.error("Error saving post: ", await response.text());
          }
        } 
        // if already saved, remove the saved post using DELETE /:postId/save
        else {
          const response = await fetch(`/api/v1/posts/${post._id}/save`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });
          if (response.ok) {
            // update local state to mark as unsaved (icon turns white)
            setIsSaved(false);
          } else {
            console.error("Error removing saved post: ", await response.text());
          }
        }
      } catch (error) {
        console.error("Error toggling saved state: ", error);
      }
  };

  useEffect(() => {
    if (user?.username && token) {
      fetch(`${import.meta.env.VITE_SERVER_URI}/users/followers/${user.username}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to fetch followers");
          }
          return response.json();
        })
        .then((data) => {
          setFollowers(data.data);
        })
        .catch((error) => {
          console.error("Error fetching followers", error);
        });

      getUserGroups({ userId: user._id }).then((response) => {
        setGroups(response.data.data);
      }).catch((error) => {
        console.error("Error fetching groups", error);
      });
    }
  }, [user?.username, token]);

  const filteredFollowers = followers.filter((follower) =>
    follower.username.toLowerCase().includes(chatSearch.toLowerCase())
  );

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(chatSearch.toLowerCase())
  );
  
  
  return (
    <div>
      <div className="postcard m-3 md:m-10 mt-3">
        <div className="flex header items-center gap-2">
          <div className="flex gap-2 items-center">
            <div className='w-fit'>
              <img
                src={otherUser && otherUser.profilePicture}
                className="w-10 h-10 rounded-full"
                alt=""
              />
            </div>
            <div className="flex-col">
              <div onClick={() =>{ 
                navigate(`/user/${otherUser && otherUser.username}`)
                window.location.reload()
              }
                } className="pl-1 cursor-pointer text-sm md:text-md font-semibold hover:underline">{otherUser && otherUser.username}</div>
              <div className="text-muted-foreground text-sm flex gap-1 items-center">
                <Globe className="w-4 h-4" />
                <div className='text-xs md:text-sm'>
                  {formatDistanceToNow(postCreationTime, { addSuffix: true })}
                </div>
              </div>
            </div>
          </div>
          <div className="ml-auto pr-10">
            {otherUser?._id != user?._id && <FollowButton userIdToFollow={otherUser && otherUser._id} 
            callback={followCallback} 
            />}
          </div>
        </div>
        <div className="w-3/4 h-[2px] mx-auto m-4 bg-muted"></div>
        <div className='text-lg p-1 font-bold'>{convertToHyperlink(post.title)}</div>

        <div className="text-sm p-2 break-words"
          dangerouslySetInnerHTML={{ __html : readMore?convertUrlsToLinks(post.content):convertUrlsToLinks(post.content.slice(0,300))}}></div>
          {post.content.length>300? (<span className="text-blue-500 cursor-pointer" onClick={()=>setReadMore(!readMore)}>
            {readMore?"...Read Less":"...Read More"}
          </span>):""}
          {post.media && Array.isArray(post.media) && post.media.length > 0 && (
            <div className="w-full overflow-hidden">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide p-2">
                {post.media.map((mediaUrl: string, index: number) => (
                  <Dialog key={index}>
                    <div className="rounded-lg flex-shrink-0">
                      <DialogTrigger>
                        {mediaUrl.match(/\.(jpeg|jpg|gif|png)$/) && (
                          <img
                            src={mediaUrl}
                            className="border-[6px] border-muted cursor-pointer rounded-xl h-64 object-cover"
                            alt=""
                          />
                        )}
                        {mediaUrl.match(/\.(mp4|webm|ogg)$/) && (
                          <video
                            src={mediaUrl}
                            width="400" height="100%"
                            className="border-[6px] border-muted cursor-pointer rounded-xl h-64 object-cover"
                            controls
                          />
                        )}
                      </DialogTrigger>
                      <DialogContent className="bg-transparent border-0">
                        {mediaUrl.match(/\.(jpeg|jpg|gif|png)$/) && (
                          <img
                            src={mediaUrl}
                            className="w-full h-full"
                            alt=""
                          />
                        )}
                        {mediaUrl.match(/\.(mp4|webm|ogg)$/) && (
                          <video
                            src={mediaUrl}
                            className="w-full h-full"
                            controls
                          />
                        )}
                      </DialogContent>
                    </div>
                  </Dialog>
                ))}
              </div>
            </div>
          )}
        <div className="w-full h-[2px] m-2 bg-muted"></div>
        <div className="flex items-center justify-around gap-2 m-3">
          <div className="flex hover:bg-muted cursor-pointer p-2 items-center gap-3 " onClick={handleLike}>
            <ThumbsUpIcon className={`w-5 h-5 ${liked?"text-red-500":""}`}  />
            <div className="text-sm">{likes}</div>
          </div>
          <div onClick={()=>{navigate(`/post/${post._id}`)}} className="flex hover:bg-muted cursor-pointer p-2  items-center gap-3">
            <MessageSquare className="w-5 h-5" />
            <div className="text-sm">{comments}</div>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <div className="flex hover:bg-muted cursor-pointer p-2 items-center gap-3" onClick={handleSharePost}>
                  <RiShare2Line className="w-5 h-5" />
                  <div className="text-sm">{post.sharedBy?.length || 0}</div>
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-[400px]">
                <DialogHeader>
                  <DialogTitle>Share Post</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/post/${post._id}`}
                    className="w-full p-2 border bg-transparent border-muted rounded mt-4"
                    onFocus={(e) => e.target.select()}
                  />
                  <div className="text-center font-semibold">Share Options</div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full flex items-center justify-center bg-accent py-2 text-black hover:text-white dark:text-white dark:hover:text-black rounded-sm">
                        <BsChatTextFill className="mr-2" /> Share in Chat
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-[400px]">
                      <DialogHeader className="flex items-center justify-between">
                        <DialogTitle>Share in Chat</DialogTitle>
                      </DialogHeader>
                      <input
                        type="text"
                        placeholder="Search followers or groups..."
                        value={chatSearch}
                        onChange={(e) => setChatSearch(e.target.value)}
                        className="w-full p-2 border border-muted rounded mb-4 mt-4 bg-transparent "
                      />
                      <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto">
                        {filteredFollowers.length > 0 ? (
                          filteredFollowers.map((follower) => (
                            <div
                              key={follower._id}
                              className="flex items-center gap-2 p-2 hover:bg-muted cursor-pointer"
                              onClick={() => {
                                const postDescription = post.content.length > 100 ? post.content.slice(0, 100) + '...' : post.content;
                                const shareUrl = `/chat/${follower.username}/share?text=Check%20this%20post%20from%20%40${post.createdBy?.username}%20%3A&title=${post.title}&description=${postDescription}&url=${window.location.origin}/post/${post._id}`;
                                navigate(shareUrl);
                              }}
                            >
                              <img
                                src={follower.profilePicture}
                                className="w-10 h-10 rounded-full"
                                alt="follower profile"
                              />
                              <div>
                                <div className="font-semibold">{follower.username}</div>
                                <div className="text-xs">{follower.bio}</div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center text-sm text-muted-foreground">
                            No followers found.
                          </div>
                        )}
                        {filteredGroups.length > 0 ? (
                          filteredGroups.map((group) => (
                            <div
                              key={group._id}
                              className="flex items-center gap-2 p-2 hover:bg-muted cursor-pointer"
                              onClick={() => {
                                const postDescription = post.content.length > 100 ? post.content.slice(0, 100) + '...' : post.content;
                                const shareUrl = `/chat/${group.name}/share?text=Check%20this%20post%20from%20%40${post.createdBy?.username}%20%3A&title=${post.title}&description=${postDescription}&url=${window.location.origin}/post/${post._id}&groupName=${group.name}`;
                                navigate(shareUrl);
                              }}
                            >
                              <img
                                src="https://res.cloudinary.com/dxygc9jz4/image/upload/t_color-white/enifyimlrv3farvfto8k.jpg"
                                className="w-10 h-10 rounded-full"
                                alt="group profile"
                              />
                              <div>
                                <div className="font-semibold">{group.name}</div>
                                <div className="text-xs">{group.description}</div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center text-sm text-muted-foreground">
                            No groups found.
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-center gap-4">
                      <button type="button" className="p-4 bg-muted rounded-full"
                        onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/post/${post._id}`); toast.success("Link copied to clipboard", { theme: "colored" }); }}>
                        <GoLink className="w-6 h-6" />
                      </button>
                      <button type="button" className="p-4 bg-muted rounded-full">
                        <a href={`mailto:?subject=See%20this%20SocialHive%20Post%20by%20%40${post.createdBy?.username}&body=See%20this%20SocialHive%20Post%20by%20%40${post.createdBy?.username}%3A%20${window.location.origin}/post/${post._id}`}><IoIosMail className="w-6 h-6" /></a>
                      </button>                    
                      <button type="button" className="p-4 bg-muted rounded-full">
                        <a href={`https://api.whatsapp.com/send/?text=${window.location.origin}/post/${post._id}&type=custom_url&app_absent=0`} target="_blank" rel="noopener noreferrer"><RiWhatsappFill className="w-6 h-6" /></a>
                      </button>
                      <button type="button" className="p-4 bg-muted rounded-full">
                        <a href={`https://www.linkedin.com/feed/?linkOrigin=LI_BADGE&shareActive=true&shareUrl=${import.meta.env.VITE_CLIENT_URL_FOR_LINKS}%2Fpost%2F${post._id}`} target="_blank" rel="noopener noreferrer"><FaLinkedin className="w-6 h-6" /></a>
                      </button>
                      <button type="button" className="p-4 bg-muted rounded-full">
                        <a href={`https://twitter.com/share?text=See%20this%20SocialHive%20Post%20by%20%40${post.createdBy?.username}&url=${import.meta.env.VITE_CLIENT_URL_FOR_LINKS}%2Fpost%2F${post._id}`} target="_blank" rel="noopener noreferrer"><FaSquareXTwitter className="w-6 h-6" /></a>
                      </button>
                    </div>
                    <div className="flex justify-center gap-4">
                      <button type="button" className="p-4 bg-muted rounded-full">
                        <a href={`https://www.reddit.com/submit?url=${import.meta.env.VITE_CLIENT_URL_FOR_LINKS}%2Fpost%2F${post._id}&title=${post.title}&type=LINK`} target="_blank" rel="noopener noreferrer"><FaReddit className="w-6 h-6" /></a>
                      </button>
                      <button type="button" className="p-4 bg-muted rounded-full">
                        <RiInstagramFill className="w-6 h-6" />
                      </button>
                      <button type="button" className="p-4 bg-muted rounded-full">
                        <a href={`https://www.facebook.com/sharer/sharer.php?app_id=1217981644879628&u=${import.meta.env.VITE_CLIENT_URL_FOR_LINKS}%2Fpost%2F${post._id}`}target="_blank" rel="noopener noreferrer"><FaFacebook className="w-6 h-6" /></a>
                      </button>
                      <button type="button" className="p-4 bg-muted rounded-full">
                        <a href={`https://www.facebook.com/dialog/send?app_id=1217981644879628&link=${import.meta.env.VITE_CLIENT_URL_FOR_LINKS}%2Fpost%2F${post._id}`}target="_blank" rel="noopener noreferrer"><FaFacebookMessenger className="w-6 h-6" /></a>
                      </button>
                      <button type="button" className="p-4 bg-muted rounded-full">
                        <a href={`https://www.threads.net/intent/post?text=See%20this%20SocialHive%20Post%20by%20%40${post.createdBy?.username}%3A%20${import.meta.env.VITE_CLIENT_URL_FOR_LINKS}%2Fpost%2F${post._id}`}target="_blank" rel="noopener noreferrer"><PiThreadsLogoFill className="w-6 h-6" /></a>
                      </button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          <div onClick={handleRepost}  className="flex hover:bg-muted cursor-pointer p-2  items-center gap-3">
            <Repeat2 className={`w-5 h-5 ${reposted && !repostLoading?"text-green-500":"" } ${repostLoading?"text-gray-500":""}`} />
            <div className="text-sm">{reposts}</div>
            </div>
            <div
              onClick={handleSavePost}
              aria-label={isSaved ? "Unsave post" : "Save post"}
              className="flex hover:bg-muted cursor-pointer p-2 items-center gap-3"
            >
              <FaRegBookmark className="w-5 h-5" color={isSaved ? "blue" : "white"} />
              <div className="text-sm">{post.savedBy?.length || 0}</div>
            </div>
        </div>
        <div className="w-full h-[2px] bg-muted"></div>
      </div>
    </div>
  )
}

export default PostCard
