import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { EllipsisVertical } from 'lucide-react';
import { FaEye } from 'react-icons/fa';
import { RiShare2Fill } from 'react-icons/ri';
import axios from 'axios';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogTrigger
} from '@/components/ui/dialog';
import { GoLink } from 'react-icons/go';
import { IoIosMail } from 'react-icons/io';
import { RiWhatsappFill, RiInstagramFill } from 'react-icons/ri';
import { FaLinkedin, FaReddit, FaFacebook, FaFacebookMessenger } from 'react-icons/fa';
import { FaSquareXTwitter } from 'react-icons/fa6';
import { PiThreadsLogoFill } from 'react-icons/pi';
import { BsChatTextFill } from 'react-icons/bs';
import { getUserGroups } from '@/api/index';
import { toast } from "react-toastify";

export interface Category {
  _id: string;
  name: string;
  description: string;
  imageUrl?: string;
  createdAt?: string;
  createdBy?: {
    _id: string;      // Add _id here
    username: string;
    profilePicture: string;
  };
}

interface CategoryCardProps {
  category: Category;
  onClick?: () => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category, onClick }) => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  // Define share URL once
    const shareUrl = `${window.location.origin}/category/${category._id}`;

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(category.name);
  const [editedDescription, setEditedDescription] = useState(category.description);
  const [editedImageUrl, setEditedImageUrl] = useState(category.imageUrl || '');
  const [error, setError] = useState('');
  const [titleError, setTitleError] = useState(''); // New state for title error

  // Handler for title field change – disallow spaces
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/\s/.test(value)) {
      setTitleError('Title cannot contain spaces.');
    } else {
      setTitleError('');
    }
    setEditedName(value);
  };

  // Delete Dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  // Share Dialog state – opens when Share button is clicked
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  // Nested dialog state for Share in Chat
  // const [isShareChatDialogOpen, setIsShareChatDialogOpen] = useState(false);
  // For share in chat search (placeholder)
  const [chatSearch, setChatSearch] = useState('');
  // Dropdown menu open state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Determine if current user is the creator
  const isCreator = user?._id === category.createdBy?._id;

  // Handler to start editing – fields become editable
  const handleStartEdit = () => {
    setEditedName(category.name);
    setEditedDescription(category.description);
    setEditedImageUrl(category.imageUrl || '');
    setError('');
    setIsEditing(true);
    setIsDropdownOpen(false);
  };

  // Handler to cancel editing
  const handleCancelEdit = () => {
    setIsEditing(false);
    setError('');
  };

  // Handler to save the edit
  const handleSaveEdit = async () => {
    if (!editedName.trim() || !editedDescription.trim()) {
      setError('Name and description cannot be empty.');
      return;
    }
    try {
      await axios.put(
        `${import.meta.env.VITE_SERVER_URI}/categories/${category._id}`,
        {
          name: editedName,
          description: editedDescription,
          imageUrl: editedImageUrl
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsEditing(false);
      window.location.reload();
    } catch (err: any) {
      console.error('Error editing category:', err);
      setError(err.response?.data?.message || 'Error updating category');
    }
  };

  // Handler to delete the category
  const handleConfirmDelete = async () => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_SERVER_URI}/categories/${category._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsDropdownOpen(false);
      window.location.reload();
    } catch (err: any) {
      console.error('Error deleting category:', err);
    }
  };

  // Handler for share actions – open share dialog
  const handleShare = () => {
    setIsShareDialogOpen(true);
  };

  // Handler for updating image via file selection
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditedImageUrl(URL.createObjectURL(file));
    }
};


    // Define the Follower type if not already defined
    interface Follower {
      _id: string;
      username: string;
      profilePicture: string;
      bio?: string;
    }
    
    const [followers, setFollowers] = useState<Follower[]>([]);
    // Define the Group type if not already defined
    interface Group {
      _id: string;
      name: string;
      description?: string;
    }
    
    const [groups, setGroups] = useState<Group[]>([]);

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

        getUserGroups({ userId: user._id })
        .then((response) => {
            setGroups(response.data.data);
        })
        .catch((error) => {
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
    <div className="relative">
      <Card className={cn("flex flex-col md:flex-row p-4 cursor-default hover:shadow-lg transition-shadow")}>
        {editedImageUrl && (
          <div className="relative">
            <img
              src={editedImageUrl}
              alt={category.name}
              // Apply onClick only to image if not editing and if onClick prop exists
              onClick={!isEditing && onClick ? onClick : undefined}
              className="w-full md:w-72 object-cover mb-4 md:mb-0 md:mr-8 rounded cursor-pointer"
            />
            {isEditing && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity">
                <Button variant="ghost" onClick={() => document.getElementById('imageInput')?.click()}>
                  Change
                </Button>
                <Button variant="ghost">
                  View
                </Button>
              </div>
            )}
            {isEditing && (
              <input
                type="file"
                id="imageInput"
                className="hidden"
                accept="image/*"
                onChange={handleImageFileChange}
              />
            )}
          </div>
        )}
        <div className="flex flex-col flex-1">
          {isEditing ? (
            <>
              <Input
                value={editedName}
                onChange={handleTitleChange}
                placeholder="Category Name"
                className="mb-2 border border-gray-400 p-2"
              />
              {titleError && <p className="text-red-500 mb-2">{titleError}</p>}
              <Input
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                placeholder="Category Description"
                className="mb-2 border border-gray-400 p-2 bg-transparent"
              />
              {error && <p className="text-red-500 mb-2">{error}</p>}
              <div className="flex gap-2">
                <Button variant="ghost" onClick={handleCancelEdit}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveEdit}
                  disabled={!!titleError || !editedName.trim() || !editedDescription.trim()}
                >
                  Save
                </Button>
              </div>
            </>
          ) : (
            <>
              <h3
                onClick={!isEditing && onClick ? onClick : undefined}
                className="text-2xl font-bold cursor-pointer mb-2"
              >
                {category.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-600 mb-6 font-semibold text-sm">
                {category.description}
              </p>
              {category.createdAt && (
                <span className="text-sm text-gray-500">
                  created at: {new Date(category.createdAt).toLocaleDateString()}
                </span>
              )}
              <div className="flex items-center mt-2 gap-2">
                <Button onClick={() => navigate(`/category/${category._id}`)} variant="ghost">
                  <FaEye className="mr-2" /> View
                </Button>
                <Button variant="ghost" onClick={handleShare}>
                  <RiShare2Fill className="mr-2" /> Share
                </Button>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Dropdown for Edit and Delete options, only for creator when not editing */}
      {isCreator && !isEditing && (
        <div className="absolute top-2 right-4">
          <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="p-2">
                <EllipsisVertical className="w-5 h-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <button
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                onClick={handleStartEdit}
              >
                Edit
              </button>
              <button
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                Delete
              </button>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="">
          <DialogHeader>
            <DialogTitle>
              Are you sure you want to delete this category?
            </DialogTitle>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Confirm Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
            {/* Nested "Share in Chat" Dialog */}
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
};

export default CategoryCard;

