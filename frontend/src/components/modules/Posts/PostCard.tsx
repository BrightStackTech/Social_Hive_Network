import { useEffect, useState } from "react";
import {
  Globe,
  EllipsisVertical,
  ThumbsUpIcon,
  MessageSquare,
  Repeat2,
  Trash2,
} from "lucide-react";
import { UserInterface } from "@/context/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { PostInterface } from "@/types";
import {  useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  createRepost,
  deletePost,
  getLikedUsers,
  getRepostedUsers,
  getUserGroups,
} from "@/api/index";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import DotLoader from "@/components/DotLoader";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// import { Check, ExternalLink, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { RiShare2Line, RiWhatsappFill, RiInstagramFill } from "react-icons/ri";
import { FaRegBookmark, FaLinkedin, FaReddit, FaFacebook, FaFacebookMessenger } from "react-icons/fa";
import { GoLink } from "react-icons/go";
import { PiThreadsLogoFill } from "react-icons/pi";
import { IoIosMail } from "react-icons/io";
import { FaSquareXTwitter } from "react-icons/fa6";
import { BsChatTextFill } from "react-icons/bs";
import axios from "axios";


const convertUrlsToLinks = (text: string): string => {
  const urlPattern = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
  const emailPattern =
    /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
  let replacedText = text.replace(
    urlPattern,
    '<a href="$1" target="_blank" class="text-blue-500 underline">$1</a>'
  );
  replacedText = replacedText.replace(
    emailPattern,
    '<a href="https://mail.google.com/mail/?view=cm&fs=1&to=$1" target="_blank" class="text-blue-500 underline">$1</a>'
  );
  return replacedText;
};

export interface PostCardProps {
  postedUser: UserInterface;
  post: PostInterface;
  refreshFunc: () => void;
}

const PostCard = ({ postedUser, post, refreshFunc }: PostCardProps) => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  // const [showPreview, setShowPreview] = useState(false);
  const [readMore, setReadMore] = useState(false);
    const [reposted, setReposted] = useState<boolean>(
      Array.isArray(post.repostedBy) && user && user._id
        ? post.repostedBy.includes(user._id)
        : false
    );
  const [likedUsers, setLikedUsers] = useState([]);
  const [repostedUsers, setRepostedUsers] = useState([]);
  const [likedUsersLoading, setLikedUsersLoading] = useState(false);
  const [repostedUsersLoading, setRepostedUsersLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isSaved, setIsSaved] = useState<boolean>(
    Array.isArray(post.savedBy) ? post.savedBy.includes(user?._id) : false
  );
  const [openChatShareDialog, setOpenChatShareDialog] = useState(false);
  const [chatSearch, setChatSearch] = useState("");
  const [followers, setFollowers] = useState<Array<{ _id: string; username: string; profilePicture: string; bio: string }>>([]);
  const [groups, setGroups] = useState<Array<{ _id: string; name: string; description: string; profilePicture: string }>>([]);
  const [userCategories, setUserCategories] = useState<Array<{ id: string; name: string }>>([]);

useEffect(() => {
  if (user?._id && token) {
    axios
      .get(`/api/v1/categories?createdBy=${user._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        // Store full category objects: id and lower-cased name
        const cats = res.data.data.map((cat: any) => ({
          id: cat._id,
          name: cat.name.toLowerCase(),
        }));
        setUserCategories(cats);
      })
      .catch((err) => {
        console.error("Error fetching user categories", err);
      });
  }
}, [user, token]);

  const handleRepostedUsersClick = async () => {
    setRepostedUsersLoading(true);
    setLikedUsersLoading(false);
    try {
      const res = await getRepostedUsers({ postId: post._id });
      setRepostedUsers(res.data.data);
    } catch {
      toast.error("Something went wrong. Please try again later.", {
        theme: "colored",
      });
    } finally {
      setRepostedUsersLoading(false);
    }
  };

  const handleLikedUsersClick = async () => {
    setLikedUsersLoading(true);
    try {
      const res = await getLikedUsers({ postId: post._id });
      setLikedUsers(res.data.data);
    } catch {
      toast.error("Something went wrong. Please try again later.", {
        theme: "colored",
      });
    } finally {
      setLikedUsersLoading(false);
    }
  };

  const handleRepostClick = async () => {
    try {
      if (post.createdBy?._id === user?._id) return;
      await createRepost({ postId: post._id });
      setReposted(!reposted);
      refreshFunc();
    } catch {
      toast.error("Something went wrong. Please try again later.", {
        theme: "colored",
      });
    }
  };

  // New function: handleSharePost calls the share route directly using fetch
  const handleSharePost = async () => {
    try {
      if (post.createdBy?._id === user?._id) return;
      const response = await fetch(`/api/v1/posts/${post._id}/share`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Assuming token is available from context, adjust header name if needed.
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        // toast.success("Post shared successfully", { theme: "colored" });
        refreshFunc();
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
      if (post.createdBy?._id === user?._id) return;
      // if not saved, then save the post using POST /:postId/save
      if (!isSaved) {
        const response = await fetch(`/api/v1/posts/${post._id}/save`, {
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

  const handleDeletePost = async (postId: string) => {
    try {
      deletePost({ postId }).then(() => {
        refreshFunc();
      });
    } catch {
      toast.error("Something went wrong. Please try again later.", {
        theme: "colored",
      });
    } finally {
      setDropdownOpen(false);
    }
  };

  useEffect(() => {
    if (user?.username && token) {
      fetch(`/api/v1/users/followers/${user.username}`, {
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

  const convertToHyperlink = (text: string) => {
    // Updated regex: captures HTTP links, full emails, and handles starting with @
    const pattern =
      /(https?:\/\/[^\s]+)|([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)|(@[a-zA-Z0-9_]+)/g;

    return text.split(pattern).map((part, index) => {
      if (!part) return null;

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
        );
      } else if (part.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+$/)) {
        const isGmail = part.toLowerCase().includes("@gmail.com");
        const href = isGmail
          ? `https://mail.google.com/mail/?view=cm&fs=1&to=${part}`
          : `mailto:${part}`;
        const emailClass = isGmail
          ? "text-blue-500 underline"
          : "text-orange-500 underline";
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
        );
      } else if (part.match(/^@[a-zA-Z0-9_]+$/)) {
        // Remove the "@" symbol for matching
        const handleName = part.slice(1).toLowerCase();
        const foundCategory = userCategories.find((cat) => cat.name === handleName);
        if (foundCategory) {
          return (
            <a
              key={index}
              onClick={() => navigate(`/category/${foundCategory.id}`)}
              className="text-orange-500 cursor-pointer"
            >
              {part}
            </a>
          );
        } else {
          return (
            <span
              key={index}
              onClick={() => navigate(`/post/${post._id}`)}
              className="cursor-pointer"
            >
              {part}
            </span>
          );
        }
      } else {
        // For any remaining normal text, make it clickable to redirect to the post page.
        return (
          <span
            key={index}
            onClick={() => navigate(`/post/${post._id}`)}
            className="cursor-pointer"
          >
            {part}
          </span>
        );
      }
    });
  };

  const postCreationTime = new Date(post.createdAt!);
  return (
    <div>
      <div className="postcard m-3 md:m-10 mt-3">
        <div className="flex header items-center gap-2">
          <div className="flex gap-2 items-center">
            <div className="w-fit">
              <img
                src={postedUser?.profilePicture}
                className="w-10 h-10 rounded-full"
                alt="profile"
              />
            </div>
            <div className="flex-col">
              <div
                onClick={() => {
                  navigate(`/user/${postedUser.username}`);
                }}
                className={`pl-1 font-semibold hover:underline cursor-pointer`}
              >
                {postedUser.username}
              </div>
              <div className="text-muted-foreground text-xs md:text-sm flex gap-1 items-center">
                <Globe className="w-4 h-4" />
                <div>{formatDistanceToNow(postCreationTime, { addSuffix: true })}</div>
              </div>
            </div>
          </div>
          <div className="ml-auto pr-10">
            {!reposted && (
              <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                <DropdownMenuTrigger>
                  <EllipsisVertical className="h-8 cursor-pointer hover:bg-muted" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <Dialog>
                    <DialogTrigger className="w-full">
                      <Button
                        variant={"destructive"}
                        className="flex items-center gap-2 w-full"
                      >
                        <Trash2 size={20} /> Delete
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          Are you sure you want to delete this post?
                        </DialogTitle>
                      </DialogHeader>
                      <DialogClose asChild>
                        <Button
                          variant={"destructive"}
                          onClick={() => handleDeletePost(post._id)}
                        >
                          Delete
                        </Button>
                      </DialogClose>
                      <DialogClose asChild>
                        <Button>Cancel</Button>
                      </DialogClose>
                    </DialogContent>
                  </Dialog>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
        <div className="w-3/4 h-[2px] mx-auto m-4 bg-muted"></div>
        <div className="text-lg p-1 font-bold">
          {convertToHyperlink(post.title)}
        </div>
        <div
          className="text-sm p-2 break-words"
          dangerouslySetInnerHTML={{
            __html: readMore
              ? convertUrlsToLinks(post.content)
              : convertUrlsToLinks(post.content.slice(0, 300)),
          }}
        ></div>
        {post.content.length > 300 && (
          <span
            className="text-blue-500 cursor-pointer"
            onClick={() => setReadMore(!readMore)}
          >
            {readMore ? "...Read Less" : "...Read More"}
          </span>
        )}
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
                          alt="media"
                        />
                      )}
                      {mediaUrl.match(/\.(mp4|webm|ogg)$/) && (
                        <video
                          src={mediaUrl}
                          width="400"
                          height="100%"
                          className="border-[6px] border-muted cursor-pointer rounded-xl h-64 object-cover"
                          controls
                        />
                      )}
                    </DialogTrigger>
                    <DialogContent className="bg-transparent border-0">
                      {mediaUrl.match(/\.(jpeg|jpg|gif|png)$/) && (
                        <img src={mediaUrl} className="w-full h-full" alt="media" />
                      )}
                      {mediaUrl.match(/\.(mp4|webm|ogg)$/) && (
                        <video src={mediaUrl} className="w-full h-full" controls />
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
          <div className="flex flex-col justify-center items-center">
            <div className="flex hover:bg-muted cursor-pointer p-2 items-center gap-3">
              <ThumbsUpIcon className="w-5 h-5" />
              <div className="text-sm">{post.likes?.length}</div>
            </div>
            {!reposted && (
              <Dialog>
                <DialogTrigger>
                  <div
                    onClick={handleLikedUsersClick}
                    className="text-xs cursor-pointer hover:bg-muted hover:underline"
                  >
                    See Liked Users
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-[400px]">
                  <DialogHeader>
                    <DialogTitle>Liked Users</DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto">
                    {likedUsersLoading && <DotLoader />}
                    {likedUsers.map((user: UserInterface) => (
                      <div
                        onClick={() => navigate(`/user/${user.username}`)}
                        key={user._id}
                        className="flex gap-2 items-center cursor-pointer hover:bg-muted p-2"
                      >
                        <img
                          src={user?.profilePicture}
                          className="w-10 h-10 rounded-full"
                          alt="profile"
                        />
                        <div>{user.username}</div>
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
          <div
            onClick={() => navigate(`/post/${post._id}`)}
            className="flex hover:bg-muted cursor-pointer p-2 items-center gap-3"
          >
            <MessageSquare className="w-5 h-5" />
            <div className="text-sm">{post.comments?.length}</div>
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
                <div className="text-center font-semibold">Share Options : </div>
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
                              setOpenChatShareDialog(false);
                              console.log(openChatShareDialog);
                            }}
                          >
                            <img
                              src={follower?.profilePicture}
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
                              setOpenChatShareDialog(false);
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
          <div className="flex flex-col justify-center items-center">
            <div
              onClick={handleRepostClick}
              className="flex hover:bg-muted cursor-pointer p-2 items-center gap-3"
            >
              <Repeat2
                className={`w-5 h-5 ${reposted ? "text-green-500" : ""}`}
              />
              <div className="text-sm">
                {post.repostedBy?.length || 0}
              </div>
            </div>
            {!reposted && (
              <Dialog>
                <DialogTrigger>
                  <div
                    onClick={handleRepostedUsersClick}
                    className="text-xs cursor-pointer hover:bg-muted hover:underline"
                  >
                    See Reposted Users
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-[400px]">
                  <DialogHeader>
                    <DialogTitle>Reposted Users</DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto">
                    {repostedUsersLoading && <DotLoader />}
                    {repostedUsers.map((user: UserInterface) => (
                      <div
                        onClick={() => navigate(`/user/${user.username}`)}
                        key={user._id}
                        className="flex gap-2 items-center cursor-pointer hover:bg-muted p-2"
                      >
                        <img
                          src={user?.profilePicture}
                          className="w-10 h-10 rounded-full"
                          alt="profile"
                        />
                        <div>{user.username}</div>
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
          <div
            onClick={handleSavePost}
            aria-label={isSaved ? "Unsave post" : "Save post"}
            className="flex hover:bg-muted cursor-pointer p-2 items-center gap-3"
          >
            <FaRegBookmark className="w-5 h-5" color={isSaved ? "blue" : "black dark:white"} />
            <div className="text-sm">{post.savedBy?.length || 0}</div>
          </div>
        </div>
        <div className="w-full h-[2px] bg-muted"></div>
      </div>
    </div>
  );
};

export default PostCard;