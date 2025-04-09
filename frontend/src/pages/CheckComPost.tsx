import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MdComment, MdModeEdit, MdDelete} from 'react-icons/md';
import { ArrowUp, ArrowDown, EllipsisVertical } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import JoinLeaveButton from '@/components/modules/JoinLeaveButton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ComCommentCard from '@/components/modules/ComCommentCard';
import { ComComment } from '@/components/modules/ComCommentCard';
import MobileUserNavbar from '@/components/sections/MobileUserNavbar'; // Import MobileUserNavbar
import { Dialog, DialogContent, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { FaTimes } from 'react-icons/fa';

const CheckComPost = () => {
  const { id } = useParams<{ id: string }>();
  const { user, token } = useAuth();
  const [post, setPost] = useState<any>(null);
  const [voteCount, setVoteCount] = useState(0);
  const [upvoted, setUpvoted] = useState(false);
  const [downvoted, setDownvoted] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [unjoinedCommunities, setUnjoinedCommunities] = useState<any[]>([]);
  const [comment, setComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [error, setError] = useState('');
  // const [showMenu, setShowMenu] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const userId = user?._id ?? '';
  const scrollableDiv = useRef<HTMLDivElement>(null);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  //const [isEdited, setIsEdited] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [editedMedia, setEditedMedia] = useState<string[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [joinedCommunities, setJoinedCommunities] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [resizableHeight, setResizableHeight] = useState(50);

  // console.log("REMOVED MEMBER : ",post?.community?.removedMem);
  // console.log("USER_ID", user?._id )
  // console.log("ISREMOVED? : ",post?.community?.removedMem.includes(user?._id));
  // console.log("ISREMOVED NOW? : ",)
  const isRemovedOrPendingMember = post?.community?.removedMem?.some((member: { _id: { toString: () => string | undefined; }; }) => member._id?.toString() === user?._id?.toString()) || post?.community?.pendingReq?.some((member: { _id: { toString: () => string | undefined; }; }) => member._id?.toString() === user?._id?.toString());
  
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_SERVER_URI}/composts/${id}`);
        setPost(response.data);
        setVoteCount(response.data.pointsCount || 0);
        setUpvoted(response.data.upvotedBy?.includes(user?._id) || false);
        setDownvoted(response.data.downvotedBy?.includes(user?._id) || false);
        setEditedTitle(response.data.title || '');
        setEditedDescription(response.data.description || '');
        setEditedMedia(response.data.media || []);
      } catch (error) {
        console.error('Error fetching post:', error);
      }
    };

    const fetchComments = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_SERVER_URI}/composts/${id}/comments`);
        const sortedComments = response.data.sort((a: ComComment, b: ComComment) => {
          if (b.pointsCount === a.pointsCount) {
            return new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime();
          }
          return (b.pointsCount ?? 0) - (a.pointsCount ?? 0);
        });
        setComments(sortedComments);
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };

    const fetchUnjoinedCommunities = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_SERVER_URI}/communities/unjoined-communities`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUnjoinedCommunities(response.data.data);
      } catch (error) {
        console.error('Error fetching unjoined communities:', error);
      }
    };

      const fetchJoinedCommunities = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_SERVER_URI}/communities/joined-communities`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setJoinedCommunities(response.data.data);
      } catch (error) {
        console.error('Error fetching joined communities:', error);
      }
    };
    

    fetchPost();
    fetchComments();
    fetchUnjoinedCommunities();
    fetchJoinedCommunities();
  }, [id, user, token]);

  useEffect(() => {
    const fetchCommunityAdmin = async () => {
      try {
        if (post?.community?.communityName) {
          const response = await axios.get(`${import.meta.env.VITE_SERVER_URI}/communities/${post.community.communityName}`);
          const community = response.data.data;
          setIsAdmin(community.admin._id === userId);
        }
      } catch (error) {
        console.error('Error fetching community admin:', error);
      }
    };

    if (post?.community?.communityName) {
      fetchCommunityAdmin();
    }
  }, [post, userId]);

  const handleJoinLeave = async (communityName: string) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_SERVER_URI}/communities/${communityName}/join-leave`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 200) {
        setUnjoinedCommunities(prevCommunities =>
          prevCommunities.map(community =>
            community.communityName === communityName
              ? { ...community, isJoined: !community.isJoined }
              : community
          )
        );
      }
    } catch (error) {
      console.error('Error joining/leaving community:', error);
    }
  };

  const handleUpvote = async () => {
    try {
      if (downvoted) {
        setDownvoted(false);
        setVoteCount(voteCount + 1);
        await axios.post(`${import.meta.env.VITE_SERVER_URI}/composts/${post._id}/remove-downvote`, {}, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
      if (!upvoted) {
        setUpvoted(true);
        setVoteCount(voteCount + 1);
        await axios.post(`${import.meta.env.VITE_SERVER_URI}/composts/${post._id}/upvote`, {}, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } else {
        setUpvoted(false);
        setVoteCount(voteCount - 1);
        await axios.post(`${import.meta.env.VITE_SERVER_URI}/composts/${post._id}/remove-upvote`, {}, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('Error upvoting:', error);
    }
  };

  const handleDownvote = async () => {
    try {
      if (voteCount > 0) {
        if (upvoted) {
          setUpvoted(false);
          setVoteCount(voteCount - 1);
          await axios.post(`${import.meta.env.VITE_SERVER_URI}/composts/${post._id}/remove-upvote`, {}, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        }
        if (!downvoted) {
          setDownvoted(true);
          setVoteCount(voteCount - 1);
          await axios.post(`${import.meta.env.VITE_SERVER_URI}/composts/${post._id}/downvote`, {}, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        } else {
          setDownvoted(false);
          setVoteCount(voteCount + 1);
          await axios.post(`${import.meta.env.VITE_SERVER_URI}/composts/${post._id}/remove-downvote`, {}, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        }
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
      await axios.put(`${import.meta.env.VITE_SERVER_URI}/composts/${post._id}/edit`, {
        title: editedTitle,
        description: editedDescription,
        media: editedMedia,
        isEdited: true,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setIsEditing(false);
      //setIsEdited(true);
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

  const handleConfirmDelete = () => {
    setIsDeleteDialogOpen(false);
    // Add your delete logic here
    console.log('Delete post');
  };

  const handlePreviewImage = (url: string) => {
    setPreviewImage(url);
    setIsPreviewDialogOpen(true);
  };

  const handleRemoveImage = (index: number) => {
    const updatedMedia = editedMedia.filter((_, i) => i !== index);
    setEditedMedia(updatedMedia);
  };
  

  const handleAddComment = async () => {
    if (!comment.trim()) return;
    setCommentLoading(true);
    setError('');
    try {
      const response = await axios.post(`${import.meta.env.VITE_SERVER_URI}/composts/${post._id}/comments`, { commentBody: comment, communityId: post.community._id, postId: post._id }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 201) {
        setComments(prevComments => [response.data, ...prevComments]);
        setComment('');
      }
    } catch (err) {
      setError('Failed to post comment. Please try again.');
    } finally {
      setCommentLoading(false);
    }
  };

  const createdAt = post?.createdAt ? new Date(post.createdAt) : null;
  const formattedDate = createdAt ? formatDistanceToNow(createdAt, { addSuffix: true }) : 'Unknown date';

  const isAuthor = post?.author?._id === user?._id;

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

  const handleSearchChange1 = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredJoinedCommunities = joinedCommunities.filter((community) =>
    community?.communityName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    const startY = e.clientY;
    const startHeight = resizableHeight;

    const onMouseMove = (e: MouseEvent) => {
      const deltaY = startY - e.clientY; // Reverse the calculation
      const newHeight = startHeight + (deltaY / window.innerHeight) * 100;
      setResizableHeight(Math.min(Math.max(newHeight, 20), 80)); // Limit height between 20% and 80%
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };
return (
  <div className="flex w-full h-screen overflow-hidden">
    <div className="flex flex-col w-full lg:w-2/3 overflow-y-auto" ref={scrollableDiv}>
      <MobileUserNavbar scrollableDiv={scrollableDiv} />
      <div className="p-4"> {/* Add padding to this inner div */}
        {post && (
          <>
            <div className="flex border p-4 mb-4 w-full bg-white dark:bg-gray-800 ">
              <div className="flex flex-col items-center mr-4 ">
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
                    <div className="flex gap-2">
                      <Button variant="ghost" onClick={handleCancelEdit}>
                        Cancel
                      </Button>
                      <Button variant="ghost" onClick={handleSaveEdit} disabled={!editedTitle.trim()}>
                        Save
                      </Button>
                    </div>
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
                  </>
                ) : (
                  <>
                    <span className="text-lg font-bold">{renderTextWithLinks(post.title || 'Untitled')}</span>{post.isEdited && <span className="text-l text-gray-400 italic ml-2">(edited)</span>}
                    <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap ">
                      {renderTextWithLinks(post.description)}
                    </div>
                    <div className="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-400 overflow-x-auto" style={{ maxWidth: 'calc(4 * 8rem + 3 * 0.5rem)', scrollbarWidth: 'thin', scrollbarColor: '#888 transparent' }}>
                      {post.media && post.media.map((url: string, index: number) => (
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
                  <MdComment className="mr-1" />
                  {comments.length} comments
                </div>
              </div>
              {(isAdmin || isAuthor) && (
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
              )}
            </div>
            <div className="border-b"></div>
            <h2 className="text-xl font-bold mt-6 mb-4 px-4 ">Comments</h2>
              <div className="mb-20">
                {comments.map((comment) => (
                  <ComCommentCard key={comment._id} comment={comment} />
                ))}
              </div>
          </>
        )}
      </div>
    </div>
    <div className="fixed bottom-0 w-full md:w-auto md:left-1/4 md:right-1/4 bg-muted px-4 py-3 border-t ">
      {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
      <div className="flex items-center gap-2 ">
        <img src={user?.profilePicture} className="w-8 h-8 rounded-full" alt={user?.username} />
        {isRemovedOrPendingMember ? (
          <div className="justify-center ml-4 mb-2 w-[75%]">
            <p className="text-red-500 mt-2 text-sm">Maybe you're being removed from the community that is associated with this post.</p>
          </div>
            ) : (
              <>
              <div className="w-full">
                <Input
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="flex-1 w-full"
                  placeholder="Add a comment..."
                />
              </div>
              <Button onClick={handleAddComment} disabled={commentLoading || !comment.trim()}>
                {commentLoading ? 'Posting...' : 'Post'}
              </Button>
            </>
          )
        }
      </div>
    </div>
      <div className="hidden lg:flex flex-col w-1/3 h-screen overflow-hidden border-l-[1px]">
        <div className="text-xl font-semibold m-5 ml-2">Top Communities</div>
        <div className="relative flex border-y-[] flex-col overflow-auto" style={{ height: `${100 - resizableHeight}%` }}>
          {unjoinedCommunities.map((community) => (
            <div key={community._id} className="accountCard flex items-center justify-between gap-1 p-3 h-14 w-[95%] mx-auto border-y-[1px]">
              <div className="flex items-center gap-1">
                <div className="min-w-fit">
                  <img src={community.profilePicture} className="w-10 h-10 rounded-full" alt={community.communityName} />
                </div>
                <div>
                  <Link to={`/communities/c/${community.communityName}`} className="font-semibold overflow-ellipsis hover:underline">
                    {community.communityName}
                  </Link>
                  <p className="text-xs text-muted-foreground">{community.description}</p>
                </div>
              </div>
              <JoinLeaveButton
                communityName={community.communityName}
                isJoined={false}
                isRemoved={community.removedMem.includes(user?._id)}
                isPending={community.pendingReq.includes(user?._id)}
                onJoinLeave={() => handleJoinLeave(community.communityName)}
              />
            </div>
          ))}
        </div>
        <div
          className="cursor-row-resize bg-gray-300 dark:bg-gray-700 h-2"
          onMouseDown={handleMouseDown}
        ></div>
        <div className="relative flex flex-col overflow-auto" style={{ height: `${resizableHeight}%` }}>
          <div className="text-xl font-semibold m-5 ml-2">Joined Communities</div>
          <input
            type="text"
            placeholder="Search joined communities..."
            value={searchQuery}
            onChange={handleSearchChange1}
            className="w-[95%] mx-auto p-2 border border-muted rounded mb-4 mt-4 bg-transparent"
          />
          {filteredJoinedCommunities.map((community) => (
            <div key={community._id} className="accountCard flex items-center justify-between gap-1 p-3 h-14 w-[95%] mx-auto border-y-[1px]">
              <div className="flex items-center gap-1">
                <div className="min-w-fit">
                  <img src={community.profilePicture} className="w-10 h-10 rounded-full" alt={community.communityName} />
                </div>
                <div>
                  <Link to={`/communities/c/${community.communityName}`} className="font-semibold overflow-ellipsis hover:underline">
                    {community.communityName}
                  </Link>
                  <p className="text-xs text-muted-foreground">{community.description}</p>
                </div>
              </div>
              <JoinLeaveButton
                communityName={community.communityName}
                isJoined={true}
                isRemoved={community.removedMem.includes(user?._id)}
                isPending={community.pendingReq.includes(user?._id)}
                onJoinLeave={() => handleJoinLeave(community.communityName)}
              />
            </div>
          ))}
        </div>
      </div>
    <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
      <DialogContent className="fixed w-full h-full flex items-center justify-center bg-transparent z-50 max-h-[600px]">
        {previewImage && (
          <div className="relative">
            {/* <button
              className="absolute top-0 right-0 m-2 text-white text-bold text-2xl z-10"
              style={{backgroundColor: 'black'}}
                    onClick={() => setIsPreviewDialogOpen(false)}
            >
              <MdClose />
            </button> */}
            <img src={previewImage} alt="Preview" className="rounded-md max-h-[600px]" />
          </div>
        )}
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

export default CheckComPost;
