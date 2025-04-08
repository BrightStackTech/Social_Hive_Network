import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { formatDistanceToNow } from 'date-fns';
import { FaEye } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import { useAuth } from '@/context/AuthContext';

const CheckUserUpdatePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  interface Update {
    _id: string;
    media: string;
    postedBy: {
      _id: string;
      username: string;
      profilePicture: string;
    };
    createdAt: string;
    viewCount: number;
    description: string;
  }

  const [updates, setUpdates] = useState<Update[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [viewers, setViewers] = useState<Viewer[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [timer, setTimer] = useState<null | NodeJS.Timeout>(null);
  const [interval, setIntervalState] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        const response = await axios.get(`/api/v1/updates/${userId}`);
        setUpdates(response.data);
      } catch (error) {
        console.error('Error fetching updates:', error);
      }
    };

    fetchUpdates();
  }, [userId]);

  useEffect(() => {
    if (isDialogOpen) {
      if (timer) {
        clearTimeout(timer);
      }
      if (interval) {
        clearInterval(interval);
      }
      if (videoRef.current) {
        videoRef.current.pause();
      }
      return;
    }

    setProgress(0);
    let duration = 9000;

    if (updates.length > 0) {
      const currentUpdate = updates[currentIndex];
      const isVideo = currentUpdate.media.match(/\.(mp4|webm|ogg)$/);

      if (isVideo && videoRef.current) {
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            duration = Math.min(videoRef.current.duration * 1000, 9000);
          }
          startProgress(duration);
        };
      } else {
        startProgress(duration);
      }
    }
  }, [currentIndex, updates, isDialogOpen]);

  interface StartProgress {
    (duration: number): () => void;
  }

  const startProgress: StartProgress = (duration) => {
    setProgress(0);
    const intervalId: NodeJS.Timeout = setInterval(() => {
      setProgress((prev) => Math.min(prev + (100 / (duration / 100)), 100));
    }, 100);
    setIntervalState(intervalId);

    const timerId: NodeJS.Timeout = setTimeout(() => {
      if (currentIndex < updates.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        navigate(-1);
        setTimeout(() => {
          window.location.reload();
        }, 250); 
      }
    }, duration);
    setTimer(timerId);

    return () => {
      clearTimeout(timerId);
      clearInterval(intervalId);
    };
  };

  const handleNext = () => {
    if (currentIndex < updates.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/v1/updates/${currentUpdate._id}`);
      setUpdates(updates.filter((update) => update._id !== currentUpdate._id));
      navigate(-1);
    } catch (error) {
      console.error('Error deleting update:', error);
    }
  };

  interface Viewer {
    _id: string;
    username: string;
    profilePicture: string;
    bio: string;
  }

  const incrementViewCount = async (updateId: string, viewerId: string): Promise<void> => {
    try {
      await axios.post(`/api/v1/updates/${updateId}/view`, { viewerId });
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  };

  interface Viewer {
    _id: string;
    username: string;
    profilePicture: string;
    bio: string;
  }

  const fetchViewers = async (updateId: string): Promise<void> => {
    try {
      const response = await axios.get<Viewer[]>(`/api/v1/updates/${updateId}/viewers`);
      setViewers(response.data);
    } catch (error) {
      console.error('Error fetching viewers:', error);
    }
  };

  useEffect(() => {
    if (updates.length > 0) {
      const currentUpdate = updates[currentIndex];
      if (user) {
        incrementViewCount(currentUpdate._id, user._id);
      }
    }
  }, [currentIndex, updates]);

  if (updates.length === 0) {
    return <div>No updates found.</div>;
  }

  const currentUpdate = updates[currentIndex];

  if (!currentUpdate) {
    return <div>Loading...</div>;
  }

  const isVideo = currentUpdate.media.match(/\.(mp4|webm|ogg)$/);

  return (
    <Dialog open={true} onOpenChange={() => {
      window.history.back();
      setTimeout(() => {
        window.location.reload();
      }, 250); // Adjust delay as needed
    }}>
      <DialogContent>
        <div className="absolute top-0 left-0 w-full h-1 bg-transparent">
          <div
            className="h-full transition-all duration-500 ease-linear"
            style={{ width: `${progress}%`, backgroundColor: progress === 100 ? 'white' : 'rgba(255, 255, 255, 0.3)' }}
          ></div>
        </div>
        {user && user._id === currentUpdate.postedBy._id && (
          <div className="absolute top-8 left-4 right-4 flex justify-between items-center z-20">
            <Dialog>
              <DialogTrigger onClick={() => fetchViewers(currentUpdate._id)}>
                <div className="flex items-center space-x-2">
                  <FaEye className="text-white" />
                  <span className="text-white underline cursor-pointer">{currentUpdate.viewCount} viewers</span>
                </div>
              </DialogTrigger>
              <DialogContent>
                <div>
                  <h2 className="text-lg font-bold mb-4">Viewers</h2>
                  {viewers.length === 0 ? (
                    <p>No viewers yet.</p>
                  ) : (
                    <div className="flex flex-col mt-3 gap-2 max-h-[70vh] overflow-y-auto ">
                      {viewers.map((viewer) => (
                        <div key={viewer._id} className="flex items-center gap-2 cursor-pointer h-[60px]" onClick={() => {
                          navigate(`/user/${viewer.username}`)
                          setTimeout(() => {
                            window.location.reload();
                          }, 250);
                        }}>
                          <img src={viewer.profilePicture} className="w-10 h-10 rounded-full" alt="" />
                          <div className="flex flex-col">
                            <div className="font-bold">{viewer.username}</div>
                            <div className="text-sm text-muted-foreground line-clamp-1">{viewer.bio}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
            <Dialog>
              <DialogTrigger>
                <div className="flex items-center space-x-2">
                  <MdDelete className="text-red-500 cursor-pointer" />
                  <span className="text-red-500 underline cursor-pointer">Delete</span>
                </div>
              </DialogTrigger>
              <DialogContent>
                <div className="p-4">
                  <p>Are you sure you want to delete this update?</p>
                  <div className="flex justify-end space-x-4 mt-4">
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
        <div className={`absolute ${user && user._id === currentUpdate.postedBy._id ? "top-16" : "top-8"} left-4 flex items-center space-x-2 z-20`}>
          <img src={currentUpdate.postedBy.profilePicture} alt="Profile" className="w-8 h-8 rounded-full shadow-lg" />
          <div>
            <Link to={`/user/${currentUpdate.postedBy.username}`} className="text-white font-bold shadow-lg">
              {currentUpdate.postedBy.username}
            </Link>
            <p className="text-xs text-gray-300 shadow-lg">{formatDistanceToNow(new Date(currentUpdate.createdAt))} ago</p>
          </div>
        </div>
        <div className="flex col justify-between items-center relative">
          <Button onClick={handlePrevious} disabled={currentIndex === 0} className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10">
            <ArrowLeft />
          </Button>
          <div className="relative w-full mt-8">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-gray-900 to-transparent z-10"></div>
            {isVideo ? (
              <video ref={videoRef} src={currentUpdate.media} autoPlay className="w-full h-auto max-h-[600px] z-0" />
            ) : (
              <img src={currentUpdate.media} alt="Update Media" className="w-full h-auto max-h-[600px] z-0" />
            )}
            <p className="mt-4 text-center">{currentUpdate.description}</p>
          </div>
          <Button onClick={handleNext} disabled={currentIndex === updates.length - 1} className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10">
            <ArrowRight />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CheckUserUpdatePage;