import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { createPost } from '@/api/index';
import { toast } from 'react-toastify';
import Cropper, { ReactCropperElement } from "react-cropper";
import "cropperjs/dist/cropper.css";
import { Dialog, DialogContent, DialogClose, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import {
  Check,
  ExternalLink,
  Mail,
} from "lucide-react";
import { FaTimes } from 'react-icons/fa';  // Make sure you have react-icons installed.
import Loader from '@/components/Loader'; // Ensure the correct path and case sensitivity

export default function CreatePostModule() {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [cropperRefs, setCropperRefs] = useState<React.RefObject<ReactCropperElement>[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [maxReachedTitle, setMaxReachedTitle] = useState(false);
  const [maxReachedContent, setMaxReachedContent] = useState(false);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState<number | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Keep track of original “final” (cropped or not) image/video files.
  const [postMediaUrls, setPostMediaUrls] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);

  // ADDED: Which images are flagged by Safe Search
  const [flaggedIndices, setFlaggedIndices] = useState<boolean[]>([]);

  // If any image is flagged, we show a warning and disable post.
  const anyFlagged = useMemo(() => flaggedIndices.some(Boolean), [flaggedIndices]);

  // If we specifically want that Google Vision message to appear only when flagged:
  useEffect(() => {
    // If any flagged images are present, show the “inappropriate” message
    if (anyFlagged) {
      setError("Selected media contains an inappropriate image. Please remove it to proceed.");
    } else {
      // If our current error is specifically the inappropriate message, clear it out
      if (error === "Selected media contains an inappropriate image. Please remove it to proceed.") {
        setError('');
      }
    }
  }, [anyFlagged]);

  // Title text
  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
    setMaxReachedTitle(event.target.value.length >= 100);
  };

  // Content text
  const handleContentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(event.target.value);
    setMaxReachedContent(event.target.value.length >= 1000);
  };

  // When the user selects files (images or videos)
  const handleMediaChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const urls = Array.from(files).map(file => URL.createObjectURL(file));
      setPostMediaUrls(urls);
      setNewFiles(Array.from(files));
      setCropperRefs(Array.from(files).map(() => React.createRef<ReactCropperElement>()));
      // Reset flaggedIndices each time new files are chosen
      setFlaggedIndices(Array(files.length).fill(false));
    }
  };

  // Utility to read a File as base64 – needed for Vision API
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = function () {
        const dataUrl = reader.result as string;
        // We only want the base64 part after the “data:mime/type;base64,”
        const base64String = dataUrl.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // ADDED: Vision API call for safe search detection
  const detectSafeSearch = async (base64Data: string): Promise<boolean> => {
    try {
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
      if (!safeSearch) {
        return false; // If something fails, treat as safe
      }

      // Check if adult, violence, or racy is LIKELY or VERY_LIKELY
      const flaggedCategories = ['adult', 'violence', 'racy'];
      for (const category of flaggedCategories) {
        const value = safeSearch[category];
        if (value === 'LIKELY' || value === 'VERY_LIKELY') {
          return true;
        }
      }
      return false;
    } catch (err) {
      console.error("Error from Vision API:", err);
      // If the API call fails, default to no detection or treat as safe
      return false;
    }
  };

  // Called when user hits the “Upload” button in the dialog
  const handleMediaUpload = async () => {
    const croppedFiles: File[] = [];
    const croppedUrls: string[] = [];
    const newFlaggedIndices: boolean[] = Array(newFiles.length).fill(false);

    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i];
      const cropperRef = cropperRefs[i].current;
      // If it's an image but not GIF, do Crop
      if (cropperRef && file.type.startsWith('image/') && !file.type.endsWith('gif')) {
        const cropper = cropperRef.cropper;
        const canvas = cropper.getCroppedCanvas();
        await new Promise<void>((resolve) => {
          canvas.toBlob(async (blob) => {
            if (blob) {
              const croppedFile = new File([blob], `cropped_media_${i}.png`, { type: 'image/png' });
              croppedFiles.push(croppedFile);
              croppedUrls.push(URL.createObjectURL(croppedFile));

              // NOW call safe search if it’s an image
              const base64Data = await fileToBase64(croppedFile);
              const isFlagged = await detectSafeSearch(base64Data);
              if (isFlagged) {
                newFlaggedIndices[i] = true;
              }
              resolve();
            }
          }, 'image/png');
        });
      } else if (file.type.startsWith('image/')) {
        // This case is for GIF or other image we didn't crop
        croppedFiles.push(file);
        croppedUrls.push(URL.createObjectURL(file));

        // attempt safe search for GIF as well
        const base64Data = await fileToBase64(file);
        const isFlagged = await detectSafeSearch(base64Data);
        if (isFlagged) {
          newFlaggedIndices[i] = true;
        }
      } else {
        // If it’s a video, no safe search
        croppedFiles.push(file);
        croppedUrls.push(URL.createObjectURL(file));
      }
    }

    // Now update states
    setPostMediaUrls(croppedUrls);
    setNewFiles(croppedFiles);
    setUploadedFiles(croppedUrls);
    setFlaggedIndices(newFlaggedIndices);

    // Close the dialog
    setDialogOpen(false);
  };

  // Called when the dialog is closed (Upload modal)
  const handleDialogClose = () => {
    // If you prefer to reset these on each closure
    setPostMediaUrls([]);
    setUploadedFiles([]);
    setDialogOpen(false);
  };

  // Submits the post (actually uploading all files to Cloudinary)
  const handlePostSubmit = async () => {
    setLoading(true);

    // If there is any flagged image, do not proceed
    if (anyFlagged) {
      setLoading(false);
      return;
    }

    try {
      const mediaUrls: string[] = [];
      // We'll do multiple uploads in a loop
      for (let i = 0; i < newFiles.length; i++) {
        const file = newFiles[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
        formData.append('cloud_name', import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);

        const response = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/upload`, {
          method: 'POST',
          body: formData
        });
        const cloudinaryResponse = await response.json();
        mediaUrls.push(cloudinaryResponse.secure_url);
      }

      const post = {
        title,
        content,
        isPublic: true,
        onlyFollowers: false,
        tags: [],
        media: mediaUrls,
      };

      await createPost(post);
      setError('');
      window.location.reload();
    } catch (err: any) {
      if (err.status === 402) {
        toast.error(
          "There are some words in your title or content that must not be used in posts. Please remove them and try again.",
          { theme: "colored" }
        );
        setError("There are some words in your title or content that must not be used in posts. Please remove them and try again.");
      } else {
        toast.error("Something went wrong. Please try again later.", { theme: "colored" });
        setError("Something went wrong. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const autoExpand = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto'; // Reset height
      textarea.style.height = `${textarea.scrollHeight}px`; // Set height based on content
    }
  };

  useEffect(() => {
    autoExpand();
  }, []);

  return (
    <div className='m-5 mx-auto w-[95%]'>
      {loading && <Loader />}
      <div>
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          className='w-full p-2 text-gray-800 font-bold dark:text-gray-100 bg-gray-100 dark:bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400 resize-none overflow-hidden'
          placeholder='Title'
          required
          minLength={5}
          maxLength={100}
        />
        <div className={`ml-auto mt-1 mb-4 w-fit ${title.length > 90 ? 'text-red-500' : 'text-gray-400'}`}>
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
      <div className={`ml-auto mt-1 mb-4 w-fit ${content.length > 950 ? 'text-red-500' : 'text-gray-400'}`}>
        {content.length}/1000
      </div>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleDialogClose(); // Reset states when closing
          }
          setDialogOpen(open);
        }}
      >
        <DialogTrigger>
          <div className='text-blue-400 cursor-pointer font-semibold'>Upload Media</div>
        </DialogTrigger>
        <DialogContent className="w-[85%] overflow-hidden">
          <input type="file" accept="image/*,video/*" multiple onChange={handleMediaChange} />
          {postMediaUrls.length > 0 && (
            <div
              style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
              className={`flex mt-1 gap-2 ${postMediaUrls.length > 1 ? "overflow-x-auto" : "justify-center"}`}
            >
              {postMediaUrls.map((url, index) => (
                <div key={index} className="flex-shrink-0 max-w-[300px] overflow-hidden rounded-xl border-[4px] border-muted">
                  {newFiles[index]?.type.startsWith("image/") && (
                    <Cropper
                      className="rounded-xl mx-auto"
                      ref={cropperRefs[index]}
                      src={url}
                      style={{ maxHeight: 300, width: "100%" }}
                      background={false}
                      guides={true}
                    />
                  )}
                  {newFiles[index]?.type.startsWith("video/") && (
                    <video
                      className="rounded-xl mx-auto"
                      src={url}
                      style={{ maxHeight: 300, width: "100%" }}
                      controls
                    />
                  )}
                </div>
              ))}
            </div>
          )}
          <Button onClick={handleMediaUpload} className="w-full mt-4" style={{ width: "100%", maxWidth: "465px" }}>
            Upload
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog>
        <div className="m-3 mx-auto">
          {/* Thumbnails */}
          <div
            className="grid grid-cols-3 gap-4 overflow-x-auto whitespace-nowrap"
            style={{
              maxHeight: 'calc(2 * 8rem + 1rem)', // Limit height to ~2 rows
            }}
          >
            {uploadedFiles.map((url, index) => (
              <div key={index} className="relative inline-block">
                <DialogTrigger onClick={() => setSelectedMediaIndex(index)}>
                  <div>
                    {newFiles[index]?.type.startsWith('image/') && (
                      <img
                        src={url}
                        className="border-[3px] h-32 w-32 object-cover border-muted cursor-pointer rounded-md"
                        alt=""
                      />
                    )}
                    {newFiles[index]?.type.startsWith('video/') && (
                      <video
                        src={url}
                        className="border-[3px] h-32 w-32 object-cover border-muted cursor-pointer rounded-md"
                        controls
                      />
                    )}
                  </div>
                </DialogTrigger>
                <button
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    // On remove, also remove flaggedIndices
                    const updatedUrls = uploadedFiles.filter((_, i) => i !== index);
                    const updatedFiles = newFiles.filter((_, i) => i !== index);
                    const updatedFlagged = flaggedIndices.filter((_, i) => i !== index);

                    setUploadedFiles(updatedUrls);
                    setNewFiles(updatedFiles);
                    setFlaggedIndices(updatedFlagged);

                    if (selectedMediaIndex !== null) {
                      if (selectedMediaIndex === index) {
                        setSelectedMediaIndex(null);
                      } else if (selectedMediaIndex > index) {
                        setSelectedMediaIndex((prev) => (prev !== null ? prev - 1 : null));
                      }
                    }
                  }}
                >
                  <FaTimes />
                </button>
              </div>
            ))}
          </div>

          {/* Preview full-sized content */}
          <DialogContent className="bg-transparent border-0">
            {selectedMediaIndex !== null && (
              <div>
                {newFiles[selectedMediaIndex]?.type.startsWith('image/') && (
                  <img
                    src={uploadedFiles[selectedMediaIndex]}
                    className="w-full h-full"
                    alt=""
                  />
                )}
                {newFiles[selectedMediaIndex]?.type.startsWith('video/') && (
                  <video
                    src={uploadedFiles[selectedMediaIndex]}
                    className="w-full h-full"
                    controls
                  />
                )}
              </div>
            )}
          </DialogContent>
        </div>
      </Dialog>

      {/* If there is any specialized error, dump it here */}
      {error && <div className='text-red-500'>{error}</div>}

      <div className='flex justify-end'>
        <Button
          onClick={handlePostSubmit}
          disabled={maxReachedTitle || maxReachedContent || anyFlagged || !title.trim().length || !content.trim().length}
        >
          Post
        </Button>
      </div>
    </div>
  );
}