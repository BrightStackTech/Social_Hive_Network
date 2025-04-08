import React, { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ArrowUp, ArrowDown, EllipsisVertical } from 'lucide-react';
import { MdModeEdit, MdDelete } from 'react-icons/md';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Dialog, DialogContent, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

export interface ComReply {
  _id: string;
  replyBody?: string;
  createdAt?: string;
  repliedBy?: {
    _id: string;
    username?: string;
  };
  upvotedBy?: string[];
  downvotedBy?: string[];
  pointsCount?: number;
  comment?: {
    community?: {
      communityName?: string;
    };
  };
  isEdited?: boolean;
}

const ComReplyCard = ({ reply }: { reply: ComReply }) => {
  const { user } = useAuth();
  const userId = user?._id ?? '';
  const [upvoted, setUpvoted] = useState(reply.upvotedBy?.includes(userId) || false);
  const [downvoted, setDownvoted] = useState(reply.downvotedBy?.includes(userId) || false);
  const [voteCount, setVoteCount] = useState(reply.pointsCount || 0);
  const [isAdmin, setIsAdmin] = useState(false); // State to manage if the user is an admin
  const [isEditing, setIsEditing] = useState(false);
  const [editedReplyBody, setEditedReplyBody] = useState(reply.replyBody || '');
  const [isEdited, setIsEdited] = useState(reply.isEdited || false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const isAuthor = reply?.repliedBy?._id === user?._id;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setUpvoted(reply.upvotedBy?.includes(userId) || false);
    setDownvoted(reply.downvotedBy?.includes(userId) || false);
    setVoteCount(reply.pointsCount || 0);
  }, [reply, userId]);

  useEffect(() => {
    const fetchCommunityAdmin = async () => {
      try {
        const response = await axios.get(`/api/v1/communities/${reply.comment?.community?.communityName}`);
        const community = response.data.data;
        setIsAdmin(community.admin._id === userId);
      } catch (error) {
        console.error('Error fetching community admin:', error);
      }
    };

    if (reply.comment?.community?.communityName) {
      fetchCommunityAdmin();
    }
  }, [reply.comment?.community?.communityName, userId]);

  const handleUpvoteReply = async () => {
    try {
      if (downvoted) {
        setDownvoted(false);
        setVoteCount(voteCount + 1);
        await axios.post(`/api/v1/composts/replies/${reply._id}/remove-downvote`, {}, {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        });
      }
      if (!upvoted) {
        setUpvoted(true);
        setVoteCount(voteCount + 1);
        await axios.post(`/api/v1/composts/replies/${reply._id}/upvote`, {}, {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        });
      } else {
        setUpvoted(false);
        setVoteCount(voteCount - 1);
        await axios.post(`/api/v1/composts/replies/${reply._id}/remove-upvote`, {}, {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        });
      }
    } catch (error) {
      console.error('Error upvoting reply:', error);
    }
  };

  const handleDownvoteReply = async () => {
    try {
      if (voteCount > 0) {
        if (upvoted) {
          setUpvoted(false);
          setVoteCount(voteCount - 1);
          await axios.post(`/api/v1/composts/replies/${reply._id}/remove-upvote`, {}, {
            headers: {
              Authorization: `Bearer ${user?.token}`,
            },
          });
        }
        if (!downvoted) {
          setDownvoted(true);
          setVoteCount(voteCount - 1);
          await axios.post(`/api/v1/composts/replies/${reply._id}/downvote`, {}, {
            headers: {
              Authorization: `Bearer ${user?.token}`,
            },
          });
        } else {
          setDownvoted(false);
          setVoteCount(voteCount + 1);
          await axios.post(`/api/v1/composts/replies/${reply._id}/remove-downvote`, {}, {
            headers: {
              Authorization: `Bearer ${user?.token}`,
            },
          });
        }
      }
    } catch (error) {
      console.error('Error downvoting reply:', error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setIsDropdownOpen(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedReplyBody(reply.replyBody || '');
    setError('');
  };

  const handleSaveEdit = () => {
    if (!editedReplyBody.trim()) {
      setError('Reply body cannot be empty');
      return;
    }
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmEdit = async () => {
    try {
      const response = await axios.put(`/api/v1/composts/replies/${reply._id}/edit`, {
        replyBody: editedReplyBody,
        isEdited: true,
      }, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });

      setIsEditing(false);
      setIsEdited(true);
      setIsConfirmDialogOpen(false);
      setError('');
      window.location.reload(); // Reload the page after the edit is confirmed
    } catch (error) {
      console.error('Error editing reply:', error);
    }
  };

  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
    setIsDropdownOpen(false);
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`/api/v1/composts/replies/${reply._id}/delete`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });
      setIsDeleteDialogOpen(false);
      window.location.reload(); // Reload the page after the delete is confirmed
    } catch (error) {
      console.error('Error deleting reply:', error);
    }
  };

  const createdAt = reply?.createdAt ? new Date(reply.createdAt) : null;
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

  return (
    <div className="relative flex border p-2 mb-2 ml-8 bg-white dark:bg-gray-800 transition-transform transform hover:scale-102 hover:bg-gray-100 dark:hover:bg-gray-700">
      <div className="flex flex-col items-center mr-4">
        <ArrowUp
          className={`cursor-pointer ${upvoted ? 'text-red-500' : 'text-gray-500'}`}
          onClick={handleUpvoteReply}
        />
        <div className="text-sm font-semibold">{Math.max(voteCount, 0)}</div>
        <ArrowDown
          className={`cursor-pointer ${downvoted ? 'text-blue-500' : 'text-gray-500'}`}
          onClick={handleDownvoteReply}
        />
      </div>
      <div className="flex-1">
        {isEditing ? (
          <>
            <Input
              value={editedReplyBody}
              onChange={(e) => setEditedReplyBody(e.target.value)}
              className="text-sm text-black dark:text-white mb-2"
            />
            {error && <p className="text-red-500">{error}</p>}
            <div className="flex gap-2">
              <Button variant="ghost" onClick={handleCancelEdit}>
                Cancel
              </Button>
              <Button variant="ghost" onClick={handleSaveEdit} disabled={!editedReplyBody.trim()}>
                Save
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="text-sm text-black dark:text-white whitespace-pre-wrap">
              {renderTextWithLinks(reply?.replyBody || 'No reply body available')}
            </div>
            {reply.isEdited && <div className="text-sm text-gray-400 italic">(edited)</div>}
          </>
        )}
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Replied by{' '}
          <a href={`/user/${reply?.repliedBy?.username}`} className="hover:underline text-orange-500">
            {reply?.repliedBy?.username || 'Unknown user'}
          </a>{' '}
          {formattedDate}
        </div>
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
        <DialogContent >
          <DialogTitle>Are you sure you want to delete this Reply?</DialogTitle>
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

export default ComReplyCard;