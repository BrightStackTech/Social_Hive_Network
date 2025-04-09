import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import Cropper, { ReactCropperElement } from "react-cropper";
import "cropperjs/dist/cropper.css";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/context/AuthContext';

interface CreateCommunityModalProps {
  onClose: () => void;
}

const CreateCommunityModal: React.FC<CreateCommunityModalProps> = ({ onClose }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isUnique, setIsUnique] = useState(true);
  const [loading, setLoading] = useState(false);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
  const [croppedProfilePicture, setCroppedProfilePicture] = useState<File | null>(null);
  const [isCropDialogOpen, setIsCropDialogOpen] = useState(false);
  const cropperRef = useRef<ReactCropperElement>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const checkCommunityNameUnique = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/v1/communities/check-community-name', {
          params: { communityName: name },
        });
        setIsUnique(response.data.data);
      } catch (error) {
        console.error('Error checking community name uniqueness:', error);
      } finally {
        setLoading(false);
      }
    };

    if (name.length > 0) {
      checkCommunityNameUnique();
    } else {
      setIsUnique(true);
    }
  }, [name]);

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePictureUrl(reader.result as string);
        setIsCropDialogOpen(true); // Open the crop dialog when a file is selected
      };
      reader.readAsDataURL(file);
      setProfilePicture(file);
      console.log(profilePicture);
    }
  };

  const handleProfilePictureCrop = () => {
    if (cropperRef.current) {
      const canvas = cropperRef.current?.cropper.getCroppedCanvas();
      if (canvas) {
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'profile_picture.png', { type: 'image/png' });
            setCroppedProfilePicture(file);
            setProfilePictureUrl(URL.createObjectURL(file)); // Update the preview with the cropped image
            setIsCropDialogOpen(false); // Close the crop dialog
          }
        }, 'image/png');
      }
    }
  };

const handleCreateCommunity = async () => {
  try {
    setLoading(true);
    let profilePictureUrl = '';

    if (croppedProfilePicture) {
      const formData = new FormData();
      formData.append('file', croppedProfilePicture);
      formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
      formData.append('cloud_name', import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/upload`, {
        method: 'POST',
        body: formData,
      });

      const cloudinaryResponse = await response.json();
      profilePictureUrl = cloudinaryResponse.secure_url;
    }

    const response = await axios.post('/api/v1/communities/create-community', {
      communityName: name,
      description,
      profilePicture: profilePictureUrl,
    }, {
      headers: {
        Authorization: `Bearer ${user?.token}`, // Include the authentication token in the request headers
      },
    });
    console.log('Community created:', response.data);
    setLoading(false);
    onClose(); // Close the dialog on successful creation
    navigate(`/communities/c/${name}`);
  } catch (error) {
    console.error('Error creating community:', error);
    toast.error("Internal Server Error");
    setLoading(false);
  }
};

  return (
    <div>
      <div className='flex flex-col gap-2' style={{ marginTop: '20px' }}>
        <Input
          maxLength={20}
          placeholder='Name'
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {!isUnique && <p className='text-red-500'>Community name already exists</p>}
        {/\s/.test(name) && <p className='text-red-500'>Community name should not contain spaces</p>}
        {loading && <p className='animate-spin inline-block size-6 border-[3px] border-current border-t-transparent text-blue-600 rounded-full'>  </p>}
        <p>{name.length}/20</p>

        <Input
          maxLength={100}
          placeholder='Description'
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <p>{description.length}/100</p>

        <Dialog open={isCropDialogOpen} onOpenChange={setIsCropDialogOpen}>
          <DialogTrigger>
            <Button variant="outline" className="mt-2">Add Profile Picture</Button>
          </DialogTrigger>
          <DialogContent className="w-[85%] overflow-hidden">
            <DialogTitle>Crop Profile Picture</DialogTitle>
            <input type="file" accept="image/*" onChange={handleProfilePictureChange} />
            {profilePictureUrl && (
              <Cropper
                ref={cropperRef}
                src={profilePictureUrl}
                style={{ height: 300, width: '100%' }}
                aspectRatio={1}
                guides={true}
                background={false}
              />
            )}
            <Button onClick={handleProfilePictureCrop} className="w-full mt-4">Crop</Button>
          </DialogContent>
        </Dialog>

        {profilePictureUrl && (
          <div className="mt-4">
            <img src={profilePictureUrl} alt="Cropped Profile" className="w-32 h-32 rounded-full mx-auto" />
          </div>
        )}
      </div>
      <Button className='mt-2' disabled={!isUnique || name.length === 0 || loading || /\s/.test(name)} onClick={handleCreateCommunity}>
        Create Community
      </Button>
    </div>
  );
};

export default CreateCommunityModal;