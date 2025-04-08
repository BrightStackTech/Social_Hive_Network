import { useState } from 'react';
import { Button } from '../ui/button';
import { useAuth } from '@/context/AuthContext';

const FollowButton = ({ className, userIdToFollow, callback }: { className?: string, userIdToFollow: string|undefined, 
  callback?: () => void
 }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { followOrUnfollowUser, following } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const isFollowing = following.includes(userIdToFollow!);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  const handleFollowAction = async () => {
    setIsLoading(true);
    try {
      await followOrUnfollowUser(userIdToFollow!);
      if (callback) callback();
    } catch (error) {
      console.error(error);
      // toast.error("Failed to update follow status. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Button 
        variant={isFollowing ? (isHovered ? 'default' : 'outline') : 'default'}
        className={`${className} min-w-28`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleFollowAction}
        disabled={isLoading}
      >
        {isLoading ? 'Loading...' : (isFollowing ? (isHovered ? 'Unfollow' : 'Following') : 'Follow')}
      </Button>
    </div>
  );
};

export default FollowButton;
