import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FaTimes } from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Loader from '@/components/Loader';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';

function CreateUpdatesModal() {
  const [description, setDescription] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<File | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [isMediaSelected, setIsMediaSelected] = useState(false);

  const handleMediaChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedMedia(file);
    setIsMediaSelected(false);
    if (file) {
      const url = URL.createObjectURL(file);
      setMediaUrl(url);
      setIsPreviewDialogOpen(true);
    }
  };

  const handleRemoveMedia = () => {
    setSelectedMedia(null);
    setMediaUrl(null);
    setIsMediaSelected(false);
  };

  const handleSelectMedia = () => {
    setIsMediaSelected(true);
    setIsPreviewDialogOpen(false);
  };

  const handleCancelPreview = () => {
    setSelectedMedia(null);
    setMediaUrl(null);
    setIsMediaSelected(false);
    setIsPreviewDialogOpen(false);
  };

  const handleSubmit = async () => {
    if (!selectedMedia || !isMediaSelected) return;

    setLoading(true);

    const formData = new FormData();
    formData.append('file', selectedMedia);
    formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
    formData.append('cloud_name', import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/upload`, {
        method: 'POST',
        body: formData,
      });

      const cloudinaryResponse = await response.json();
      const mediaUrl = cloudinaryResponse.secure_url;

      const payload = {
        media: mediaUrl,
        description,
        postedBy: user?._id, // Ensure this is the user's ID
      };

      await axios.post(`${import.meta.env.VITE_SERVER_URI}/updates`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (user) {
        navigate(`/user/${user._id}/updates`);
      }
    } catch (error) {
      console.error('Error creating update:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      {loading && <Loader />}
      <div className="flex space-x-4 mb-4">
        <Button variant="outline" onClick={() => document.getElementById('mediaInput')?.click()} disabled={!!selectedMedia}>
          Upload from Device
        </Button>
        <Button variant="outline" onClick={() => alert('Capture functionality not implemented yet')} disabled={!!selectedMedia}>
          Capture
        </Button>
        <input
          id="mediaInput"
          type="file"
          accept="image/*,video/*"
          onChange={handleMediaChange}
          className="hidden"
        />
      </div>
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent>
          <DialogTitle>Preview Media</DialogTitle>
          {mediaUrl && (
            <div className="relative mb-4 mt-4">
              {selectedMedia?.type.startsWith('image/') ? (
                <div className="justify-center items-center flex h-auto w-auto">
                  <img src={mediaUrl} alt="Selected media" className="h-auto max-h-[400px] rounded-md" />
                </div>
              ) : (
                <div className="justify-center items-center flex h-auto w-auto">
                  <video src={mediaUrl} controls className="h-auto max-h-[400px] rounded-md" />
                </div>
              )}
            </div>
          )}
          <div className="flex justify-end">
            <Button onClick={handleSelectMedia}>Select</Button>
            <Button variant="outline" onClick={handleCancelPreview} className="ml-2">Cancel</Button>
          </div>
        </DialogContent>
      </Dialog>
      {mediaUrl && isMediaSelected && (
        <div className="relative mb-4">
          {selectedMedia?.type.startsWith('image/') ? (
            <img src={mediaUrl} alt="Selected media" className="h-auto max-h-[400px] rounded-md" />
          ) : (
            <video src={mediaUrl} controls className="h-auto max-h-[400px] rounded-md" />
          )}
          <button className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1" onClick={handleRemoveMedia}>
            <FaTimes />
          </button>
        </div>
      )}
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full p-2 border rounded-md bg-transparent"
        placeholder="Add a description (optional)"
      />
      <div className="flex justify-end mt-4">
        <Button onClick={handleSubmit} disabled={!selectedMedia || !isMediaSelected}>
          Post
        </Button>
      </div>
    </div>
  );
}

export default CreateUpdatesModal;
