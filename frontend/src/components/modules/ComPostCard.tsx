import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdComment, MdModeEdit, MdDelete } from 'react-icons/md';
import { ArrowUp, ArrowDown, EllipsisVertical } from 'lucide-react';
import { BsChatTextFill, BsThreeDotsVertical } from 'react-icons/bs';
import { formatDistanceToNow } from 'date-fns';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger, DialogClose, DialogHeader } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { FaFacebook, FaFacebookMessenger, FaLinkedin, FaReddit, FaTimes } from 'react-icons/fa';
import { FiShare2 } from "react-icons/fi";
import { FaSquareXTwitter } from 'react-icons/fa6';
import { GoLink } from 'react-icons/go';
import { IoIosMail } from 'react-icons/io';
import { PiThreadsLogoFill } from 'react-icons/pi';
import { RiShare2Line, RiWhatsappFill, RiInstagramFill } from 'react-icons/ri';
import { toast } from 'react-toastify';
import { getUserGroups } from '@/api/index';

export interface ComPost {
  _id: string;
  title?: string;
  description?: string;
  pointsCount?: number;
  upvotedBy?: string[];
  downvotedBy?: string[];
  comments?: { _id: string }[];
  commentCount?: number;
  createdAt?: string;
  media?: string[];
  community?: {
    communityName?: string;
    admin?: string; // Assuming community has an admin field
  };
  author?: {
    username?: string;
    _id?: string;
  };
  isEdited?: boolean;
  // Add other properties as needed
}

const ComPostCard = ({ post }: { post: ComPost }) => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [voteCount, setVoteCount] = useState(post.pointsCount || 0);
  const userId = user?._id ?? '';
  const [upvoted, setUpvoted] = useState(post.upvotedBy?.includes(userId) || false);
  const [downvoted, setDownvoted] = useState(post.downvotedBy?.includes(userId) || false);
  const [comments, setComments] = useState(post.comments?.length || 0);
  const [showMenu, setShowMenu] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(post.title || '');
  const [editedDescription, setEditedDescription] = useState(post.description || '');
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editedMedia, setEditedMedia] = useState<string[]>(post.media || []);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [error, setError] = useState('');
  interface Follower {
    _id: string;
    username: string;
    profilePicture: string;
    bio: string;
  }
  
  interface Group {
    _id: string;
    name: string;
    description: string;
  }
  
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [chatSearch, setChatSearch] = useState("");

  useEffect(() => {
    const userId = user?._id ?? '';
    setVoteCount(post.pointsCount || 0);
    setUpvoted(post.upvotedBy?.includes(userId) || false);
    setDownvoted(post.downvotedBy?.includes(userId) || false);
  }, [post, user]);

  useEffect(() => {
    const fetchCommunityAdmin = async () => {
      try {
        const response = await axios.get(`/api/v1/communities/${post.community?.communityName}`);
        const community = response.data.data;
        setIsAdmin(community.admin._id === userId);
      } catch (error) {
        console.error('Error fetching community admin:', error);
      }
    };

    if (post.community?.communityName) {
      fetchCommunityAdmin();
    }
  }, [post.community, userId]);

  useEffect(() => {
    setEditedTitle(post.title || '');
    setEditedDescription(post.description || '');
    setEditedMedia(post.media || []);
  }, [post]);

  const handleUpvote = async () => {
    try {
      if (downvoted) {
        setDownvoted(false);
        setVoteCount(voteCount + 1);
        await axios.post(`/api/v1/composts/${post._id}/remove-downvote`, {}, {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        });
      }
      if (!upvoted) {
        setUpvoted(true);
        setVoteCount(voteCount + 1);
        await axios.post(`/api/v1/composts/${post._id}/upvote`, {}, {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        });
      } else {
        setUpvoted(false);
        setVoteCount(voteCount - 1);
        await axios.post(`/api/v1/composts/${post._id}/remove-upvote`, {}, {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        });
      }
    } catch (error) {
      console.error('Error upvoting:', error);
    }
  };

  const handleDownvote = async () => {
    try {
      if (upvoted) {
        setUpvoted(false);
        setVoteCount(voteCount - 1);
        await axios.post(`/api/v1/composts/${post._id}/remove-upvote`, {}, {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        });
      }
      if (!downvoted) {
        setDownvoted(true);
        setVoteCount(voteCount - 1);
        await axios.post(`/api/v1/composts/${post._id}/downvote`, {}, {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        });
      } else {
        setDownvoted(false);
        setVoteCount(voteCount + 1);
        await axios.post(`/api/v1/composts/${post._id}/remove-downvote`, {}, {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        });
      }
    } catch (error) {
      console.error('Error downvoting:', error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setIsDropdownOpen(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedTitle(post.title || '');
    setEditedDescription(post.description || '');
    setEditedMedia(post.media || []);
  };

  const handleSaveEdit = () => {
    if (!editedTitle.trim()) {
      setError('Title cannot be empty');
      return;
    }
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmEdit = async () => {
    try {
      const response = await axios.put(`/api/v1/composts/${post._id}/edit`, {
        title: editedTitle,
        description: editedDescription,
        media: editedMedia,
        isEdited: true,
      }, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });

      setIsEditing(false);
      setIsConfirmDialogOpen(false);
      setError('');
      window.location.reload(); // Reload the page after the edit is confirmed
    } catch (error) {
      console.error('Error editing post:', error);
    }
  };

  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
    setIsDropdownOpen(false);
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`/api/v1/composts/posts/${post._id}/delete`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });
      setIsDeleteDialogOpen(false);
      window.location.reload(); // Reload the page after the delete is confirmed
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handlePreviewImage = (url: string) => {
    setPreviewImage(url);
    setIsPreviewDialogOpen(true);
  };

  const handleRemoveImage = (index: number) => {
    const updatedMedia = editedMedia.filter((_, i) => i !== index);
    setEditedMedia(updatedMedia);
  };

  const createdAt = post.createdAt ? new Date(post.createdAt) : null;
  const formattedDate = createdAt ? formatDistanceToNow(createdAt, { addSuffix: true }) : 'Unknown date';

  const truncateDescription = (description: string | undefined): string => {
    if (!description) {
      return 'No description available';
    }
    if (description.length > 65) {
      return description.substring(0, 65) + '...';
    }
    return description;
  };

  const isAuthor = post.author?._id === user?._id;

  const urlPattern = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
  const emailPattern = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;

  const renderTextWithLinks = (text: string | undefined) => {
    if (!text) return null;

    return text.split(' ').map((part, index) => {
      if (urlPattern.test(part)) {
        return (
          <a key={index} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
            {part}
          </a>
        );
      } else if (emailPattern.test(part)) {
        return (
          <a key={index} href={`https://mail.google.com/mail/?view=cm&fs=1&to=${part}&tf=cm`} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
            {part}
          </a>
        );
      } else {
        return <span key={index}>{part} </span>;
      }
    });
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

  
  return (
    <div className="relative flex border p-4 mb-4 bg-white dark:bg-gray-800 transition-transform transform hover:scale-102 hover:bg-gray-100 dark:hover:bg-gray-700">
      <div className="flex flex-col items-center mr-4">
        <ArrowUp
          className={`cursor-pointer ${upvoted ? 'text-red-500' : 'text-gray-500'}`}
          onClick={handleUpvote}
        />
        <div className="text-sm font-semibold">{Math.max(voteCount, 0)}</div>
        <ArrowDown
          className={`cursor-pointer ${downvoted ? 'text-blue-500' : 'text-gray-500'}`}
          onClick={handleDownvote}
        />
      </div>
      <div className="flex-1">
        {isEditing ? (
          <>
            <Input
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="text-lg font-bold mb-2"
            />
            {error && <p className="text-red-500">{error}</p>}
            <Input
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              className="text-sm text-gray-600 dark:text-gray-400 mb-2"
            />
            <div className="mt-4 grid grid-cols-3 gap-4 mb-4">
              {editedMedia.map((url, index) => (
                <div key={index} className="relative">
                  <img
                    src={url}
                    alt={`Media ${index}`}
                    className="w-full h-32 object-cover rounded-md cursor-pointer"
                    onClick={() => handlePreviewImage(url)}
                  />
                  <button
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                    onClick={() => handleRemoveImage(index)}
                  >
                    <FaTimes />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={handleCancelEdit}>
                Cancel
              </Button>
              <Button variant="ghost" onClick={handleSaveEdit} disabled={!editedTitle.trim()}>
                Save
              </Button>
            </div>
          </>
        ) : (
          <><div className="w-[100%]">
              <span className="text-lg font-bold cursor-pointer" onClick={() => navigate(`/compost/${post._id}`)}>
                {renderTextWithLinks(post.title || 'Untitled')}
              </span>{post.isEdited && <span className="text-l text-gray-400 italic ml-2">(edited)</span>}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
              {renderTextWithLinks(truncateDescription(post.description))}
            </div>
            
            <div className="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-400 overflow-x-auto" style={{ maxWidth: 'calc(4 * 8rem + 3 * 0.5rem)', scrollbarWidth: 'thin', scrollbarColor: '#888 transparent' }}>
              {post.media && post.media.map((url, index) => (
                <img key={index} src={url} alt={`Media ${index}`} className="w-32 h-32 object-cover rounded-md mr-2 flex-shrink-0 cursor-pointer" onClick={() => handlePreviewImage(url)} />
              ))}
            </div>
          </>
        )}
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-4">
          <a href={`/communities/c/${post.community?.communityName}`} className="hover:underline text-orange-500">
            c/{post.community?.communityName || 'Unknown community'}
          </a>{' '}
          Posted by{' '}
          <a href={`/user/${post.author?.username}`} className="hover:underline text-orange-500">
            {post.author?.username || 'Unknown user'}
          </a>{' '}
          {formattedDate}
        </div>
        <div className="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
          <Button className="cursor-pointer" variant="ghost" onClick={() => navigate(`/compost/${post._id}`)}>
            <MdComment className="mr-1" />
            {post.commentCount} comments
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="cursor-pointer" variant="ghost">
                <FiShare2 className="mr-1"/>
                Share
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[400px]">
              <DialogHeader>
                <DialogTitle>Share Post</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/compost/${post._id}`}
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
                              const postDescription = (post.description ?? '').length > 100 ? (post.description ?? '').slice(0, 100) + '...' : (post.description ?? '');
                              const shareUrl = `/chat/${follower.username}/share?text=Check%20this%20community%20post%20from%20%40${post.author?.username}%20%3A&title=${post.title}&description=${postDescription}&url=${window.location.origin}/compost/${post._id}`;
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
                              const postDescription = (post.description ?? '').length > 100 ? (post.description ?? '').slice(0, 100) + '...' : (post.description ?? '');
                              const shareUrl = `/chat/${group.name}/share?text=Check%20this%20community%20post%20from%20%40${post.author?.username}%20%3A&title=${post.title}&description=${postDescription}&url=${window.location.origin}/compost/${post._id}&groupName=${group.name}`;
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
                      onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/compost/${post._id}`); toast.success("Link copied to clipboard", { theme: "colored" }); }}>
                      <GoLink className="w-6 h-6" />
                    </button>
                    <button type="button" className="p-4 bg-muted rounded-full">
                      <a href={`mailto:?subject=See%20this%20SocialHive%20Community%20Post%20by%20%40${post.author?.username}&body=See%20this%20SocialHive%20Community%20Post%20by%20%40${post.author?.username}%3A%20${window.location.origin}/compost/${post._id}`}><IoIosMail className="w-6 h-6" /></a>
                    </button>                    
                    <button type="button" className="p-4 bg-muted rounded-full">
                      <a href={`https://api.whatsapp.com/send/?text=${window.location.origin}/compost/${post._id}&type=custom_url&app_absent=0`} target="_blank" rel="noopener noreferrer"><RiWhatsappFill className="w-6 h-6" /></a>
                    </button>
                    <button type="button" className="p-4 bg-muted rounded-full">
                      <a href={`https://www.linkedin.com/feed/?linkOrigin=LI_BADGE&shareActive=true&shareUrl=${import.meta.env.VITE_CLIENT_URL_FOR_LINKS}%2Fcompost%2F${post._id}`} target="_blank" rel="noopener noreferrer"><FaLinkedin className="w-6 h-6" /></a>
                    </button>
                    <button type="button" className="p-4 bg-muted rounded-full">
                      <a href={`https://twitter.com/share?text=See%20this%20SocialHive%20Community%20Post%20by%20%40${post.author?.username}&url=${import.meta.env.VITE_CLIENT_URL_FOR_LINKS}%2Fcompost%2F${post._id}`} target="_blank" rel="noopener noreferrer"><FaSquareXTwitter className="w-6 h-6" /></a>
                    </button>
                  </div>
                  <div className="flex justify-center gap-4">
                    <button type="button" className="p-4 bg-muted rounded-full">
                      <a href={`https://www.reddit.com/submit?url=${import.meta.env.VITE_CLIENT_URL_FOR_LINKS}%2Fcompost%2F${post._id}&title=${post.title}&type=LINK`} target="_blank" rel="noopener noreferrer"><FaReddit className="w-6 h-6" /></a>
                    </button>
                    <button type="button" className="p-4 bg-muted rounded-full">
                      <RiInstagramFill className="w-6 h-6" />
                    </button>
                    <button type="button" className="p-4 bg-muted rounded-full">
                      <a href={`https://www.facebook.com/sharer/sharer.php?app_id=1217981644879628&u=${import.meta.env.VITE_CLIENT_URL_FOR_LINKS}%2Fcompost%2F${post._id}`}target="_blank" rel="noopener noreferrer"><FaFacebook className="w-6 h-6" /></a>
                    </button>
                    <button type="button" className="p-4 bg-muted rounded-full">
                      <a href={`https://www.facebook.com/dialog/send?app_id=1217981644879628&link=${import.meta.env.VITE_CLIENT_URL_FOR_LINKS}%2Fcompost%2F${post._id}`}target="_blank" rel="noopener noreferrer"><FaFacebookMessenger className="w-6 h-6" /></a>
                    </button>
                    <button type="button" className="p-4 bg-muted rounded-full">
                      <a href={`https://www.threads.net/intent/post?text=See%20this%20SocialHive%20Post%20by%20%40${post.author?.username}%3A%20${import.meta.env.VITE_CLIENT_URL_FOR_LINKS}%2Fcompost%2F${post._id}`}target="_blank" rel="noopener noreferrer"><PiThreadsLogoFill className="w-6 h-6" /></a>
                    </button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      {(isAdmin || isAuthor) ? (
        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <Button className="cursor-pointer text-gray-500 text-2xl font-bold" variant="ghost">
              <EllipsisVertical size={20} />
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <button
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={handleEdit}
            >
              <MdModeEdit className="mr-2" />
              Edit
            </button>
            <button
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={handleDelete}
            >
              <MdDelete className="mr-2" />
              Delete
            </button>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}

      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="fixed w-full h-full flex items-center justify-center bg-transparent z-50 max-h-[600px]">
          <div className="relative">
            {previewImage && (
              <img src={previewImage} alt="Preview" className="rounded-md  max-h-[600px]" />
            )}
           </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogTitle>Are you sure you want to confirm this edit?</DialogTitle>
          <div className="flex justify-end gap-2 mt-4">
            <DialogClose asChild>
              <Button variant="ghost" onClick={() => setIsConfirmDialogOpen(false)}>
                Cancel
              </Button>
            </DialogClose>
            <Button variant="ghost" className="text-orange-500" onClick={handleConfirmEdit}>
              Confirm Edit
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogTitle>Are you sure you want to delete this post?</DialogTitle>
          <div className="flex justify-end gap-2 mt-4">
            <DialogClose asChild>
              <Button variant="ghost" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
            </DialogClose>
            <Button variant="ghost" className="text-red-500" onClick={handleConfirmDelete}>
              Confirm Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ComPostCard;