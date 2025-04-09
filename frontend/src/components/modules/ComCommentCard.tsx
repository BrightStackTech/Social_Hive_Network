import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MdModeEdit, MdDelete } from 'react-icons/md';
import { ArrowUp, ArrowDown, EllipsisVertical } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { HiOutlineReply } from 'react-icons/hi';
import ComReplyCard, { ComReply } from './ComReplyCard'; // Import ComReplyCard
import { LuMessageSquareReply } from "react-icons/lu";

export interface ComComment {
  _id: string;
  commentBody?: string;
  createdAt?: string;
  commentedBy?: {
    _id: string;
    username?: string;
  };
  upvotedBy?: string[];
  downvotedBy?: string[];
  pointsCount?: number;
  replies?: string[];
  community?: {
    communityName?: string;
    admin?: string;
    removedMem?: { _id: string }[];
    pendingReq?: { _id: string }[];
  };
  isEdited?: boolean;
}

const ComCommentCard = ({ comment }: { comment: ComComment }) => {
  const { user } = useAuth();
  const userId = user?._id ?? '';
  const [upvoted, setUpvoted] = useState(comment.upvotedBy?.includes(userId) || false);
  const [downvoted, setDownvoted] = useState(comment.downvotedBy?.includes(userId) || false);
  const [voteCount, setVoteCount] = useState(comment.pointsCount || 0);
  const [replyVisible, setReplyVisible] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [replies, setReplies] = useState<ComReply[]>([]);
  const [repliesVisible, setRepliesVisible] = useState(false); // State to manage visibility of replies section
  const [isAdmin, setIsAdmin] = useState(false); // State to manage if the user is an admin
  const [isEditing, setIsEditing] = useState(false);
  const [editedCommentBody, setEditedCommentBody] = useState(comment.commentBody || '');
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const isAuthor = comment?.commentedBy?._id === user?._id;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setUpvoted(comment.upvotedBy?.includes(userId) || false);
    setDownvoted(comment.downvotedBy?.includes(userId) || false);
    setVoteCount(comment.pointsCount || 0);
  }, [comment, userId]);

  useEffect(() => {
    const fetchReplies = async () => {
      try {
        const response = await axios.get(`/api/v1/composts/comments/${comment._id}/replies`, {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        });
        setReplies(response.data);
      } catch (error) {
        console.error('Error fetching replies:', error);
      }
    };

    fetchReplies(); // Fetch replies when the component mounts
  }, [comment._id, user?.token]);

  useEffect(() => {
    const fetchCommunityAdmin = async () => {
      try {
        const response = await axios.get(`/api/v1/communities/${comment.community?.communityName}`);
        const community = response.data.data;
        setIsAdmin(community.admin._id === userId);
      } catch (error) {
        console.error('Error fetching community admin:', error);
      }
    };

    if (comment.community?.communityName) {
      fetchCommunityAdmin();
    }
  }, [comment.community, userId]);

  const handleUpvote = async () => {
    try {
      if (downvoted) {
        setDownvoted(false);
        setVoteCount(voteCount + 1);
        await axios.post(`/api/v1/composts/comments/${comment._id}/remove-downvote`, {}, {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        });
      }
      if (!upvoted) {
        setUpvoted(true);
        setVoteCount(voteCount + 1);
        await axios.post(`/api/v1/composts/comments/${comment._id}/upvote`, {}, {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        });
      } else {
        setUpvoted(false);
        setVoteCount(voteCount - 1);
        await axios.post(`/api/v1/composts/comments/${comment._id}/remove-upvote`, {}, {
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
        await axios.post(`/api/v1/composts/comments/${comment._id}/remove-upvote`, {}, {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        });
      }
      if (!downvoted && voteCount > 0) {
        setDownvoted(true);
        setVoteCount(voteCount - 1);
        await axios.post(`/api/v1/composts/comments/${comment._id}/downvote`, {}, {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        });
      } else if (downvoted) {
        setDownvoted(false);
        setVoteCount(voteCount + 1);
        await axios.post(`/api/v1/composts/comments/${comment._id}/remove-downvote`, {}, {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        });
      }
    } catch (error) {
      console.error('Error downvoting:', error);
    }
  };

  const handleReplyClick = () => {
    setReplyVisible(!replyVisible);
  };

  const handleCancelReply = () => {
    setReplyVisible(false);
    setReplyContent('');
  };

  const handlePostReply = async () => {
    try {
      const response = await axios.post(
        `/api/v1/composts/comments/${comment._id}/replies`,
        { replyBody: replyContent },
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );
      console.log('Post reply:', response.data);
      setReplies([...replies, response.data]);
      setReplyVisible(false);
      setReplyContent('');
      setRepliesVisible(true); // Show replies section after posting a reply
    } catch (error) {
      console.error('Error posting reply:', error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setIsDropdownOpen(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedCommentBody(comment.commentBody || '');
    setError('');
  };

  const handleSaveEdit = () => {
    if (!editedCommentBody.trim()) {
      setError('Comment body cannot be empty');
      return;
    }
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmEdit = async () => {
    try {
      await axios.put(`/api/v1/composts/comments/${comment._id}/edit`, {
        commentBody: editedCommentBody,
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
      console.error('Error editing comment:', error);
    }
  };

  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
    setIsDropdownOpen(false);
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`/api/v1/composts/comments/${comment._id}/delete`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });
      setIsDeleteDialogOpen(false);
      window.location.reload(); // Reload the page after the delete is confirmed
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleToggleReplies = () => {
    setRepliesVisible(!repliesVisible);
  };

  const createdAt = comment?.createdAt ? new Date(comment.createdAt) : null;
  const formattedDate = createdAt ? formatDistanceToNow(createdAt, { addSuffix: true }) : 'Unknown date';

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

  // console.log("COMMUNITY_REMOVED:",comment.community)
  // console.log("ISREMOVED:",comment.community?.removedMem)
  const isRemovedOrPendingMember = comment.community?.removedMem?.some((member) => member._id?.toString() === user?._id?.toString()) || comment.community?.pendingReq?.some((member) => member._id?.toString() === user?._id?.toString());

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
              value={editedCommentBody}
              onChange={(e) => setEditedCommentBody(e.target.value)}
              className="text-l text-black dark:text-white mb-2"
            />
            {error && <p className="text-red-500">{error}</p>}
            <div className="flex gap-2">
              <Button variant="ghost" onClick={handleCancelEdit}>
                Cancel
              </Button>
              <Button variant="ghost" onClick={handleSaveEdit} disabled={!editedCommentBody.trim()}>
                Save
              </Button>
            </div>
          </>
        ) : (
          <>
            <span className="text-l text-black dark:text-white whitespace-pre-wrap">
              {renderTextWithLinks(comment?.commentBody || 'No comment body available')}
            </span>
            {comment.isEdited && <span className="text-l text-gray-400 italic ml-2">(edited)</span>}
          </>
        )}
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Posted by{' '}
          <a href={`/user/${comment?.commentedBy?.username}`} className="hover:underline text-orange-500">
            {comment?.commentedBy?.username || 'Unknown user'}
          </a>{' '}
          {formattedDate}
        </div>
        <div className="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
          <Button className="cursor-pointer" variant="ghost" onClick={handleToggleReplies}>
            <LuMessageSquareReply className="mr-2" />
            {replies.length} Replies
          </Button>
          {!isRemovedOrPendingMember && (
            <Button className="cursor-pointer" variant="ghost" onClick={handleReplyClick}>
              <HiOutlineReply className="mr-2" />
              Reply
            </Button>
          )}
        </div>
        {replyVisible && (
          <div className="mt-2">
            <Input
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Type your reply..."
              className="w-full mb-2"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                className="hover:bg-white hover:text-black"
                onClick={handlePostReply}
              >
                Post
              </Button>
              <Button variant="ghost" onClick={handleCancelReply}>
                Cancel
              </Button>
            </div>
          </div>
        )}
        {repliesVisible && replies.map((reply) => (
          <div className="mt-2" key={reply._id}><ComReplyCard reply={reply} /></div>
        ))}
      </div>
      {(isAuthor || isAdmin) && (
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
          <DialogTitle>Are you sure you want to delete this comment?</DialogTitle>
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

export default ComCommentCard;