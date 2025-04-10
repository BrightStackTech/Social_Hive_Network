import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogClose, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import MobileUserNavbar from '@/components/sections/MobileUserNavbar';
import Cropper, { ReactCropperElement } from "react-cropper";
import "cropperjs/dist/cropper.css";
import axios from 'axios';
import NotFound from './NotFound';

const EditCommunityProfile: React.FC = () => {
    const { communityName } = useParams<{ communityName: string }>();
    const { user, token } = useAuth();
    const [community, setCommunity] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [description, setDescription] = useState('');
    const [profilePicture, setProfilePicture] = useState<File | null | undefined>(null);
    const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
    const cropperRef = useRef<ReactCropperElement>(null);
    const navigate = useNavigate();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const decodedCommunityName = decodeURIComponent(communityName || '');

    useEffect(() => {
    const fetchCommunity = async () => {
        try {
        const response = await axios.get(`${import.meta.env.VITE_SERVER_URI}/communities/${decodedCommunityName}`);
        setCommunity(response.data.data);
        setDescription(response.data.data.description);
        setProfilePictureUrl(response.data.data.profilePicture);
        } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response && error.response.status === 404) {
            navigate(`/communities/not-found`);
            } else {
            console.error('Error fetching community:', error.response?.data);
            }
        } else {
            console.error('Error fetching community:', error);
        }
        } finally {
        setLoading(false);
        }
    };

    fetchCommunity();
    }, [decodedCommunityName, navigate]);

    const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePictureUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
            setProfilePicture(file);
        }
    };

    const handleUpdateProfile = async () => {
        if (profilePicture && cropperRef.current) {
            const cropper = cropperRef.current.cropper;
            const canvas = cropper.getCroppedCanvas();
            canvas.toBlob(async (blob) => {
                if (blob) {
                    const file = new File([blob], 'profile_picture.jpg', { type: 'image/jpeg' });
                    const formData = new FormData();
                    formData.append('file', file);
                    formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
                    formData.append('cloud_name', import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);

                    const response = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/upload`, {
                        method: 'POST',
                        body: formData,
                    });

                    const cloudinaryResponse = await response.json();
                    setProfilePictureUrl(cloudinaryResponse.secure_url);
                }
            }, 'image/jpeg', 0.8);
        }

        try {
            await axios.put(`${import.meta.env.VITE_SERVER_URI}/communities/${decodedCommunityName}`, {
                description,
                profilePicture: profilePictureUrl,
            });
            navigate(`/communities/c/${decodedCommunityName}`);
        } catch (error) {
            console.error('Error updating community:', error);
        }
    };

    const handleDeleteCommunity = async () => {
        try {
            await axios.delete(`${import.meta.env.VITE_SERVER_URI}/communities/${decodedCommunityName}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            navigate('/communities');
        } catch (error) {
            console.error('Error deleting community:', error);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!community || community.admin._id !== user?._id) {
        return <NotFound />;
    }

    const isProfileTabSelected = decodeURIComponent(window.location.pathname) === `/communities/c/${decodedCommunityName}`;
    const isEditTabSelected = decodeURIComponent(window.location.pathname) === `/communities/c/${decodedCommunityName}/edit`;

    return (
        <div className='w-screen'>
            <div className="flex">
                <div className="w-full overflow-y-scroll scrollbar-hide h-screen">
                    <MobileUserNavbar scrollableDiv={null} />
                    <div className="flex border-0 border-b">
                        <div
                            className={`w-1/2 py-5 text-center cursor-pointer ${
                                isProfileTabSelected
                                    ? "font-bold text-lg text- bg-muted border-0 border-b-4 border-blue-500"
                                    : "hover:bg-slate-900 duration-200"
                            }`}
                            onClick={() => navigate(`/communities/c/${decodedCommunityName}`)}
                        >
                            Community Profile
                        </div>
                        <div
                            className={`w-1/2 py-5 text-center cursor-pointer ${
                                isEditTabSelected
                                    ? "font-bold text-lg text- bg-muted border-0 border-b-4 border-blue-500"
                                    : "hover:bg-slate-900 duration-200"
                            }`}
                        >
                            Edit Community Profile
                        </div>
                    </div>
                    <div>
                        <img src={profilePictureUrl || "/path/to/default-logo.png"} className="w-52 h-52 rounded-full mx-auto mt-10 mb-4" alt="" />
                        <div className='flex gap-3 justify-center w-80 mx-auto'>
                            <Dialog>
                                <DialogTrigger>
                                    <div className=' text-blue-400 cursor-pointer font-semibold'>Edit Profile Picture</div>
                                </DialogTrigger>
                                <DialogContent className='w-[85%]'>
                                    <DialogTitle className='text-center font-bold mt-4'>Update Profile Picture</DialogTitle>
                                    <Input type='file' onChange={handleProfilePictureChange} />
                                    {profilePicture && (
                                        <div className=' mx-auto max-h-[90vh] mt-4'>
                                            <Cropper
                                                ref={cropperRef}
                                                src={profilePictureUrl || ""}
                                                aspectRatio={1 / 1}
                                                style={{ height: 300, width: '100%' }}
                                                background={false}
                                                guides={true}
                                            />
                                        </div>
                                    )}
                                    <DialogClose asChild>
                                        <Button onClick={handleUpdateProfile} className='w-full mt-4'>Update</Button>
                                    </DialogClose>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                    <form onSubmit={(e) => { e.preventDefault(); handleUpdateProfile(); }}>
                        <div className='m-5'>
                            <Label htmlFor="description" className='text-xl p-1 font-bold'>Description</Label>
                            <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} className='my-1' type='text' />
                        </div>
                        <div className='w-fit ml-auto'>
                            <Button type="submit" className='m-5 '>Update Community Details</Button>
                        </div>
                    </form>
                    <div className="w-full flex justify-start px-8 mt-4">
                        <Button variant="destructive" onClick={() => setShowDeleteDialog(true)} >Delete this community</Button>
                    </div>
                    {showDeleteDialog && (
                        <Dialog open={true} onOpenChange={() => setShowDeleteDialog(false)}>
                            <DialogContent>
                                <div className="text-center text-lg">Are you sure you want to delete c/{decodedCommunityName}? Once deleted, community can't be restored back</div>
                                <div className="flex justify-center gap-4 mt-4">
                                    <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
                                    <Button variant="destructive" onClick={handleDeleteCommunity}>Delete Permanently</Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EditCommunityProfile;
