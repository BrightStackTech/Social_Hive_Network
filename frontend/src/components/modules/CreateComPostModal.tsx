import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import Cropper, { ReactCropperElement } from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import { FaTimes } from 'react-icons/fa';
import Loader from '@/components/Loader';
import { useNavigate } from 'react-router-dom';

interface CreateComPostModalProps {
  onClose: () => void;
}

const CreateComPostModal: React.FC<CreateComPostModalProps> = ({ onClose }) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [maxReachedTitle, setMaxReachedTitle] = useState(false);
  const [maxReachedContent, setMaxReachedContent] = useState(false);
  const [communities, setCommunities] = useState<any[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState<string>('');
  const [error, setError] = useState<string>('');
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isCropDialogOpen, setIsCropDialogOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [croppedImages, setCroppedImages] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const cropperRefs = useRef<React.RefObject<ReactCropperElement>[]>([]);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ----- Safe Search Additions -----
  const [flaggedIndices, setFlaggedIndices] = useState<boolean[]>([]);
  const anyFlagged = useMemo(() => flaggedIndices.some(Boolean), [flaggedIndices]);

  // Removed the useEffect that sets error when anyFlagged is true,
  // so the “inappropriate image” text only shows below the images.
  // -----

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = function () {
        const dataUrl = reader.result as string;
        const base64String = dataUrl.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const detectSafeSearch = async (base64Data: string): Promise<boolean> => {
    try {
      // Replace with your key as needed
      const visionUrl = `https://vision.googleapis.com/v1/images:annotate?key=${import.meta.env.VITE_CLOUD_VISION_API_KEY}`;
      const payload = {
        requests: [
          {
            image: { content: base64Data },
            features: [{ type: 'SAFE_SEARCH_DETECTION' }],
          },
        ],
      };

      const response = await fetch(visionUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await response.json();
      const safeSearch = json?.responses?.[0]?.safeSearchAnnotation;
      if (!safeSearch) return false;

      const flaggedCategories = ['adult', 'violence', 'racy'];
      return flaggedCategories.some(
        category => safeSearch[category] === 'LIKELY' || safeSearch[category] === 'VERY_LIKELY'
      );
    } catch (err) {
      console.error('Error from Vision API:', err);
      return false;
    }
  };
  // ----- End Safe Search Additions -----

  useEffect(() => {
    const fetchJoinedCommunities = async () => {
      try {
        const response = await axios.get('/api/v1/communities/joined-communities', {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        setCommunities(response.data.data);
      } catch (error) {
        console.error('Error fetching joined communities:', error);
      }
    };
    fetchJoinedCommunities();
  }, [user?.token]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    setMaxReachedTitle(e.target.value.length >= 100);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setMaxReachedContent(e.target.value.length >= 1000);
  };

  const autoExpand = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    autoExpand();
  }, []);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileArray = Array.from(files);
      setSelectedImages(fileArray);
      cropperRefs.current = fileArray.map(() => React.createRef<ReactCropperElement>());
      setFlaggedIndices([]);
      setIsCropDialogOpen(true);
    }
  };

const handleCropImages = async () => {
  // Process all selected images using Promise.all
  const results = await Promise.all(
    selectedImages.map(async (file, index) => {
      // If it is cropable (not GIF) and a cropper exists:
      if (
        file.type !== 'image/gif' &&
        cropperRefs.current[index]?.current?.cropper
      ) {
        return new Promise<{ croppedFile: File; flagged: boolean }>((resolve) => {
          cropperRefs.current[index].current!.cropper.getCroppedCanvas().toBlob(async (blob) => {
            if (blob) {
              const croppedFile = new File([blob], `cropped_image_${index}.png`, { type: 'image/png' });
              const base64Data = await fileToBase64(croppedFile);
              const flagged = await detectSafeSearch(base64Data);
              resolve({ croppedFile, flagged });
            } else {
              // If blob is null, treat as not flagged
              resolve({ croppedFile: file, flagged: false });
            }
          }, 'image/png');
        });
      } else if (file.type.startsWith('image/')) {
        // For GIF images or images we don't crop
        const base64Data = await fileToBase64(file);
        const flagged = await detectSafeSearch(base64Data);
        return { croppedFile: file, flagged };
      } else {
        // For non-image files (if any)
        return { croppedFile: file, flagged: false };
      }
    })
  );

  const croppedFiles = results.map(result => result.croppedFile);
  const newFlagged = results.map(result => result.flagged);
  finishCropping(croppedFiles, newFlagged);
};

  const finishCropping = (croppedFiles: File[], newFlagged: boolean[]) => {
    setCroppedImages(croppedFiles);
    setUploadedFiles(croppedFiles.map(file => URL.createObjectURL(file)));
    setFlaggedIndices(newFlagged);
    setIsCropDialogOpen(false);
  };

  const handleCancelCrop = () => {
    setSelectedImages([]);
    setCroppedImages([]);
    setUploadedFiles([]);
    setFlaggedIndices([]);
    setIsCropDialogOpen(false);
  };

  const handleRemoveImage = (index: number) => {
    const updatedImages = croppedImages.filter((_, i) => i !== index);
    const updatedFiles = uploadedFiles.filter((_, i) => i !== index);
    const updatedFlaggedIndices = flaggedIndices.filter((_, i) => i !== index);
    setCroppedImages(updatedImages);
    setUploadedFiles(updatedFiles);
    setFlaggedIndices(updatedFlaggedIndices);
  };

  const handlePreviewImage = (url: string) => {
    setPreviewImage(url);
    setIsPreviewDialogOpen(true);
  };

  const handleSubmit = async () => {
    // Just block posting if images are flagged, but don't set specific error text:
    if (anyFlagged) return;

    // If no community is selected, still show error under dropdown:
    if (!selectedCommunity) {
      setError('Select a Community first');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    const mediaUrls: string[] = [];

    for (const file of croppedImages) {
      formData.append('file', file);
      formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
      formData.append('cloud_name', import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/upload`, {
        method: 'POST',
        body: formData
      });
      const cloudinaryResponse = await response.json();
      mediaUrls.push(cloudinaryResponse.secure_url);

      formData.delete('file');
      formData.delete('upload_preset');
      formData.delete('cloud_name');
    }

    const payload = {
      title,
      description: content,
      community: selectedCommunity,
      author: user?._id,
      media: mediaUrls,
    };

    console.log('Request payload:', payload);

    try {
      const response = await axios.post('/api/v1/composts/create-compost', payload, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      console.log('Compost created:', response.data);
      setTitle('');
      setContent('');
      setSelectedCommunity('');
      setError('');
      onClose();
      navigate(`/compost/${response.data._id}`);
    } catch (error) {
      console.error('Error creating compost:', error);
    } finally {
      setLoading(false);
    }
  };

  const isSubmitDisabled =
    !title ||
    !content ||
    !selectedCommunity ||
    maxReachedTitle ||
    maxReachedContent ||
    anyFlagged;

  return (
    <div className='m-5 mx-auto w-[95%]'>
      {loading && <Loader />}
      <div className="mb-4">
        <Select value={selectedCommunity} onValueChange={setSelectedCommunity}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a community" />
          </SelectTrigger>
          <SelectContent>
            {communities.map((community) => (
              <SelectItem key={community._id} value={community._id}>
                {community.communityName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {/* Only show "Select a Community" error here */}
        {error && error !== 'Selected media contains an inappropriate image. Please remove it to proceed.' && (
          <p className="text-red-500 mt-2">{error}</p>
        )}
      </div>

      <div>
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          className="w-full p-2 text-gray-800 font-bold dark:text-gray-100 bg-gray-100 dark:bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400 resize-none overflow-hidden"
          placeholder="Title"
          required
          minLength={5}
          maxLength={100}
        />
        <div
          className={`ml-auto mt-1 mb-4 w-fit ${
            title.length > 90 ? 'text-red-500' : 'text-gray-400'
          }`}
        >
          {title.length}/100
        </div>
      </div>

      <textarea
        ref={textareaRef}
        onInput={autoExpand}
        value={content}
        onChange={handleContentChange}
        className="w-full p-4 max-h-[45vh] overflow-y-auto text-gray-800 dark:text-gray-100 bg-gray-100 dark:bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400 resize-none overflow-hidden"
        placeholder="Write your post here..."
        required
        minLength={10}
        maxLength={1000}
      />
      <div
        className={`ml-auto mt-1 mb-4 w-fit ${
          content.length > 950 ? 'text-red-500' : 'text-gray-400'
        }`}
      >
        {content.length}/1000
      </div>

      <div className="mt-4">
        <Button variant="outline" onClick={() => document.getElementById('imageInput')?.click()}>
          Choose Images
        </Button>
        <input
          id="imageInput"
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageChange}
          className="hidden"
        />
      </div>

      <div
        className="mt-4 grid grid-cols-3 g overflow-x-auto whitespace-nowrap gap-4 mb-4"
        style={{ maxHeight: 'calc(2 * 8rem + 1rem)' }}
      >
        {uploadedFiles.map((url, index) => (
          <div key={index} className="relative">
            <img
              src={url}
              alt={`Selected ${index}`}
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

      {/* This message now appears ONLY under the images. */}
      {anyFlagged && (
        <div className="text-red-500 mb-4">
          Selected media contains an inappropriate image. Please remove it to proceed.
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={isSubmitDisabled}>
          Post
        </Button>
      </div>

      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="w-[85%] bg-transparent border-0">
          <DialogTitle></DialogTitle>
          {previewImage && (
            <img src={previewImage} alt="Preview" className="w-full h-auto rounded-md" />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isCropDialogOpen} onOpenChange={setIsCropDialogOpen}>
        <DialogContent className="w-[85%] overflow-x-auto">
          <DialogTitle>Crop Images</DialogTitle>
          <div className="flex space-x-4 mt-4">
            {selectedImages.map((image, index) => (
              <div
                key={index}
                className="flex-shrink-0 max-w-[300px] overflow-hidden rounded-xl border-[4px] border-muted"
              >
                {image.type !== 'image/gif' && image.type.startsWith('image/') && (
                  <Cropper
                    ref={cropperRefs.current[index]}
                    src={URL.createObjectURL(image)}
                    style={{ height: 200, width: '100%' }}
                    guides={true}
                    background={false}
                  />
                )}
                {image.type === 'image/gif' && (
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Selected ${index}`}
                    className="w-full h-32 object-cover rounded-md"
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify gap-2 mt-4">
            <Button onClick={handleCropImages}>Crop</Button>
            <Button variant="outline" onClick={handleCancelCrop}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateComPostModal;