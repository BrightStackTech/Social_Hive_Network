import React, { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export default function CreateCategoryModal() {
  const [categoryName, setCategoryName] = useState('');
  const [description, setDescription] = useState('');
  const [nameError, setNameError] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<File | null>(null);
  const [isCropDialogOpen, setIsCropDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate(); // Assuming you have a navigate function from react-router-dom

  // Reference for Cropper instance
  const cropperRef = useRef<any>(null);
  const { user, token } = useAuth(); // Assuming you have a user and token from context

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCategoryName(value);
    if (/\s/.test(value)) {
      setNameError('Category name should not contain spaces.');
    } else {
      setNameError('');
    }
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(e.target.value);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      console.log(selectedImage);
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      setIsCropDialogOpen(true);
    }
  };

  const handleCropImage = () => {
    if (cropperRef.current && cropperRef.current.cropper) {
      cropperRef.current.cropper.getCroppedCanvas().toBlob((blob: Blob | null) => {
        if (blob) {
          const cropped = new File([blob], 'cropped_category.png', { type: 'image/png' });
          setCroppedImage(cropped);
          // Update preview to show cropped (landscape) image
          setImageUrl(URL.createObjectURL(cropped));
          setIsCropDialogOpen(false);
        }
      }, 'image/png');
    }
  };

  // Uploads the image file to Cloudinary and returns the secure URL.
  const uploadImageToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    // Update with your Cloudinary preset and cloud name
    formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET); 
    formData.append('cloud_name', import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/upload`, {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    return data.secure_url;
  };

  const handleCreateCategory = async () => {
    setIsLoading(true);
    try {
      // First, check if user already has a category with this name
      const catResponse = await fetch(`${import.meta.env.VITE_SERVER_URI}/categories?createdBy=${user?._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (catResponse.ok) {
        const catData = await catResponse.json();
        const exists = catData.data.some(
          (cat: any) => cat.name.toLowerCase() === categoryName.trim().toLowerCase()
        );
        if (exists) {
          toast.error("You've already created a category with this name.");
          setIsLoading(false);
          return;
        }
      }
      // Proceed with image upload (if cropped)
      let uploadedImageUrl = imageUrl;
      if (croppedImage) {
        uploadedImageUrl = await uploadImageToCloudinary(croppedImage);
      }
      const response = await fetch(`${import.meta.env.VITE_SERVER_URI}/categories`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: categoryName,
          description,
          imageUrl: uploadedImageUrl,
        }),
      });
      
      // Check response content type before parsing JSON.
      const contentType = response.headers.get('content-type');
      let result;
      if (contentType && contentType.indexOf('application/json') !== -1) {
        result = await response.json();
      } else {
        const errorText = await response.text();
        console.error("Server returned HTML:", errorText);
        throw new Error("Server error. Please try again later.");
      }
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to create category');
      }
      toast.success('Category created successfully');
      navigate(`/category/${result.data._id}`);
      console.log('Category created successfully', result.data);
    } catch (error: any) {
      console.error('Error creating category:', error);
      toast.error(error.message || 'Error creating category');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <Input 
          placeholder="Category Name" 
          value={categoryName} 
          onChange={handleNameChange} 
        />
        {nameError && <p className="text-red-500 text-sm mt-1">{nameError}</p>}
      </div>
      <div className="mb-4">
        <Input 
          placeholder="Category Description" 
          value={description} 
          onChange={handleDescriptionChange} 
        />
      </div>
      <div className="mb-4">
        <Button variant="outline" onClick={() => document.getElementById('categoryImageInput')?.click()}>
          Upload Image
        </Button>
        <input
          id="categoryImageInput"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
        />
      </div>
      {imageUrl && (
        <div className="mb-4">
          <img 
            src={imageUrl} 
            alt="Selected" 
            className="w-32 h-32 object-cover rounded cursor-pointer" 
            onClick={() => setIsPreviewDialogOpen(true)}
          />
        </div>
      )}
      <Dialog open={isCropDialogOpen} onOpenChange={setIsCropDialogOpen}>
        <DialogTrigger asChild>
          <div></div>
        </DialogTrigger>
        <DialogContent className="w-[85%] overflow-hidden">
          <DialogTitle>Crop Image</DialogTitle>
          {imageUrl && (
            <Cropper
              src={imageUrl}
              style={{ height: 300, width: '100%' }}
              aspectRatio={16 / 9}
              guides={true}
              background={false}
              ref={cropperRef}
              className="mt-4"
            />
          )}
          <div className="flex justify-end mt-4">
            <Button onClick={handleCropImage}>Crop</Button>
            <Button variant="outline" onClick={() => setIsCropDialogOpen(false)} className="ml-2">
              Cancel
            </Button>
          </div>
          <DialogClose />
        </DialogContent>
      </Dialog>
      {/* Preview dialog for showing the image without cropping options */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogTrigger asChild>
          <div></div>
        </DialogTrigger>
        <DialogContent className="bg-transparent border-0">
          {imageUrl && (
            <img src={imageUrl} alt="Preview" className="w-full h-full object-contain" />
          )}
          <DialogClose />
        </DialogContent>
      </Dialog>
      <Button 
        disabled={!categoryName || !!nameError || !croppedImage || isLoading}
        className="mt-4"
        onClick={handleCreateCategory}
      >
        {isLoading ? 'Creating...' : 'Create Category'}
      </Button>
    </div>
  );
}
