import React, { useRef, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ProfileSideBar from "@/components/sections/ProfileSideBar";
import MobileUserNavbar from "@/components/sections/MobileUserNavbar";
import axios from "axios";
import PostCard from "@/components/modules/Posts/PostCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";

// Sharing icons
import { FiShare2, FiArrowLeft } from "react-icons/fi";
import { BsChatTextFill } from "react-icons/bs";
import { GoLink } from "react-icons/go";
import { IoIosMail } from "react-icons/io";
import { RiWhatsappFill, RiInstagramFill } from "react-icons/ri";
import { FaLinkedin, FaReddit, FaFacebook, FaFacebookMessenger } from "react-icons/fa";
import { FaSquareXTwitter } from "react-icons/fa6";
import { PiThreadsLogoFill } from "react-icons/pi";
import { useAuth } from "@/context/AuthContext";
import { Category } from '@/components/modules/CategoryCard';

// If available, import getUserGroups from your API
import { getUserGroups } from "@/api/index";
import OthersPostCard from "@/components/modules/Posts/OthersPostCard";

function CategoryPage() {
  const scrollableDivRef = useRef<HTMLDivElement | null>(null);
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();

  const [category, setCategory] = useState<{
    _id: string;
    name: string;
    description: string;
    imageUrl?: string;
    createdAt?: string;
    createdBy?: {
      _id: string;
      profilePicture: string;
      username: string;
    };
  } | null>(null);

  const [catPosts, setCatPosts] = useState<any[]>([]);
  const [catPostsLoading, setCatPostsLoading] = useState(false);
  const { user, token } = useAuth(); // Assuming you have a token in your auth context
  // Share dialog state
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const shareUrl = category ? `${window.location.origin}/category/${category._id}` : "";

  // Nested "Share in Chat" dialog state and search/filter states
  const [isShareChatDialogOpen, setIsShareChatDialogOpen] = useState(false);
  const [chatSearch, setChatSearch] = useState("");
  const [followers, setFollowers] = useState<
    Array<{ _id: string; username: string; profilePicture: string; bio?: string }>
  >([]);
  const [groups, setGroups] = useState<Array<{ _id: string; name: string; description?: string }>>([]);

  const filteredFollowers = followers.filter((follower) =>
    follower.username.toLowerCase().includes(chatSearch.toLowerCase())
  );
  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(chatSearch.toLowerCase())
  );

  // Fetch the category details
  useEffect(() => {
    if (categoryId) {
      axios
        .get(`/api/v1/categories/${categoryId}`)
        .then((res) => {
          setCategory(res.data.data);
        })
        .catch((err) => {
          console.error("Error fetching category:", err);
        });
    }
  }, [categoryId]);

  // Fetch posts related to category
  const fetchPostsForCategory = async (categoryName: string) => {
    setCatPostsLoading(true);
    try {
      const response = await axios.get(
        `/api/v1/posts/search?query=${encodeURIComponent(categoryName)}`
      );
      // Filter posts based on two conditions:
      // 1. The post title should include the category name (or "@" + categoryName)
      // 2. The post's createdBy._id should equal the category's createdBy._id
      const filtered = response.data.data.posts.filter((post: any) => {
        const title = post.title.toLowerCase();
        const catLower = categoryName.toLowerCase();
        const titleMatches = title.includes(catLower) || title.includes("@" + catLower);
        const creatorMatches = post.createdBy?._id === category?.createdBy?._id;
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

  useEffect(() => {
    if (category) {
      fetchPostsForCategory(category.name);
    }
  }, [category]);

  // Fetch followers and groups for "Share in Chat"
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

        getUserGroups({ userId: user._id })
        .then((response) => {
            setGroups(response.data.data);
        })
        .catch((error) => {
            console.error("Error fetching groups", error);
        });
    }
    }, [user?.username, token]);


  return (
    // Outer container is full viewport height
    <div className="flex h-screen">
      {/* Left Sidebar (fixed) */}
      <div className="hidden md:block md:w-1/4 border-r">
        <ProfileSideBar />
      </div>
      
      {/* Middle Section (scrollable) */}
      <div className="w-full md:w-1/2 overflow-y-auto px-2">
        <div className="p-4">
          <button
            onClick={() => navigate(-1)}
            className=" text-xl hover:text-gray-500"
          >
            <FiArrowLeft />
          </button>
        </div>
        <MobileUserNavbar scrollableDiv={scrollableDivRef} />
        <div className="p-4">
          {category ? (
            <>
              {category.imageUrl && (
                <div className="relative mt-1 h-80 overflow-hidden rounded-lg shadow-lg mb-6">
                  <img
                    src={category.imageUrl}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                  {/* Top Gradient Overlay */}
                  <div
                    className="absolute top-0 left-0 w-full h-1/4"
                    style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0))" }}
                  ></div>
                  {/* Bottom Gradient Overlay */}
                  <div
                    className="absolute bottom-0 left-0 w-full h-1/4"
                    style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6), rgba(0,0,0,0))" }}
                  ></div>
                </div>
              )}
              
              {/* Name and Share Icon in one row */}
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold mb-1">{category.name}</h1>
                <button onClick={() => setIsShareDialogOpen(true)}>
                  <FiShare2 className="text-white text-xl" />
                </button>
              </div>
              
              <p className="text-gray-400 text-lg">{category.description}</p>
              {/* Creator info */}
              {category.createdBy && (
                <p className="text-gray-500 text-sm mt-2">
                  created by{" "}
                  <img
                    src={category.createdBy.profilePicture}
                    alt={category.createdBy.username}
                    className="inline w-6 h-6 rounded-full mr-2 ml-2"
                  />
                  <span
                    className="font-semibold hover:text-orange-600 hover:underline hover:cursor-pointer"
                    onClick={() => navigate(`/user/${category.createdBy?.username}`)}
                  >
                    {category.createdBy.username}
                  </span>{" "}
                  on{" "}
                  {category.createdAt 
                    ? new Date(category.createdAt).toLocaleDateString() 
                    : "Unknown date"}
                </p>
              )}
              
              {/* Render posts */}
              <div className="mt-8">
                <h2 className="text-2xl font-bold mb-3">
                  Posts in "{category.name}"
                </h2>
                {catPostsLoading ? (
                  <p>Loading posts…</p>
                ) : catPosts.length > 0 ? (
                  catPosts.map((post) =>
                    user && post.createdBy._id === user._id ? (
                      <PostCard
                        key={post._id}
                        post={post}
                        postedUser={post.createdBy}
                        refreshFunc={() => fetchPostsForCategory(category.name)}
                      />
                    ) : (
                      <OthersPostCard
                        key={post._id}
                        post={post}
                        otherUser={post.createdBy}
                        // You can also pass any additional callbacks if needed
                      />
                    )
                  ) 
                ) : (
                  <p>No posts found for this category.</p>
                )}
              </div>
            </>
          ) : (
            <p>Loading category...</p>
          )}
        </div>
      </div>
      
      {/* Right Blank Column (fixed) */}
      <div className="hidden lg:block lg:w-1/4 border-l">
        {/* Additional content if needed */}
      </div>

      {/* Share Dialog */}
    <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
    <DialogContent className="max-w-[400px]">
        <DialogHeader>
        <DialogTitle>Share Category</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 mt-4">
        <Input
            type="text"
            readOnly
            value={shareUrl}
            className="w-full p-2 border bg-transparent border-muted rounded"
            onFocus={(e) => e.target.select()}
        />
        <div className="text-center font-semibold">Share Options:</div>
        {/* Nested "Share in Chat" Dialog (if needed) */}
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
                className="w-full p-2 border border-muted rounded mt-4 bg-transparent"
            />
            <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto">
                {filteredFollowers.length > 0 ? (
                filteredFollowers.map((follower) => (
                    <div
                    key={follower._id}
                    className="flex items-center gap-2 p-2 hover:bg-muted cursor-pointer"
                    onClick={() => {
                        const postDescription =
                        (category?.description ?? "").length > 100
                            ? (category?.description ?? "").slice(0, 100) + "..."
                            : (category?.description ?? "");
                        const chatShareUrl = `/chat/${follower.username}/share?text=Check%20this%20Category%20from%20%40${category?.createdBy?.username}%20%3A&title=${category?.name}&description=${postDescription}&url=${window.location.origin}/category/${category?._id}`;
                        navigate(chatShareUrl);
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
                        const postDescription =
                        (category?.description ?? "").length > 100
                            ? (category?.description ?? "").slice(0, 100) + "..."
                            : (category?.description ?? "");
                        const chatShareUrl = `/chat/${group.name}/share?text=Check%20this%20Category%20from%20%40${category?.createdBy?.username}%20%3A&title=${category?.name}&description=${postDescription}&url=${window.location.origin}/category/${category?._id}&groupName=${group.name}`;
                        navigate(chatShareUrl);
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
        
        {/* First row of sharing icons */}
        <div className="flex justify-center gap-4">
            <button
            type="button"
            className="p-4 bg-muted rounded-full"
            onClick={() => {
                navigator.clipboard.writeText(shareUrl);
                toast.success("Link copied to clipboard", { theme: "colored" });
            }}
            >
            <GoLink className="w-6 h-6" />
            </button>
            <button type="button" className="p-4 bg-muted rounded-full">
            <a
                href={`mailto:?subject=See this Category&body=${shareUrl}`}
                target="_blank"
                rel="noopener noreferrer"
            >
                <IoIosMail className="w-6 h-6" />
            </a>
            </button>
            <button type="button" className="p-4 bg-muted rounded-full">
            <a
                href={`https://api.whatsapp.com/send/?text=${shareUrl}&type=custom_url&app_absent=0`}
                target="_blank"
                rel="noopener noreferrer"
            >
                <RiWhatsappFill className="w-6 h-6" />
            </a>
            </button>
            <button type="button" className="p-4 bg-muted rounded-full">
            <a
                href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
                shareUrl
                )}`}
                target="_blank"
                rel="noopener noreferrer"
            >
                <FaLinkedin className="w-6 h-6" />
            </a>
            </button>
            <button type="button" className="p-4 bg-muted rounded-full">
            <a
                href={`https://twitter.com/share?url=${encodeURIComponent(
                shareUrl
                )}&text=${encodeURIComponent(category?.name || "")}`}
                target="_blank"
                rel="noopener noreferrer"
            >
                <FaSquareXTwitter className="w-6 h-6" />
            </a>
            </button>
        </div>
        {/* Second row of sharing icons */}
        <div className="flex justify-center gap-4 mt-4">
            <button type="button" className="p-4 bg-muted rounded-full">
            <a
                href={`https://www.reddit.com/submit?url=${encodeURIComponent(
                shareUrl
                )}&title=${encodeURIComponent(category?.name || "")}`}
                target="_blank"
                rel="noopener noreferrer"
            >
                <FaReddit className="w-6 h-6" />
            </a>
            </button>
            <button type="button" className="p-4 bg-muted rounded-full">
            <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
            >
                <RiInstagramFill className="w-6 h-6" />
            </a>
            </button>
            <button type="button" className="p-4 bg-muted rounded-full">
            <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                shareUrl
                )}`}
                target="_blank"
                rel="noopener noreferrer"
            >
                <FaFacebook className="w-6 h-6" />
            </a>
            </button>
            <button type="button" className="p-4 bg-muted rounded-full">
            <a
                href={`https://www.facebook.com/dialog/send?link=${encodeURIComponent(
                shareUrl
                )}`}
                target="_blank"
                rel="noopener noreferrer"
            >
                <FaFacebookMessenger className="w-6 h-6" />
            </a>
            </button>
            <button type="button" className="p-4 bg-muted rounded-full">
            <a
                href={`https://www.threads.net/intent/post?text=${encodeURIComponent(
                "Check this Category: " + (category?.name || "") + " " + shareUrl
                )}`}
                target="_blank"
                rel="noopener noreferrer"
            >
                <PiThreadsLogoFill className="w-6 h-6" />
            </a>
            </button>
        </div>
        </div>
    </DialogContent>
    </Dialog>
    </div>
  );
}

export default CategoryPage;