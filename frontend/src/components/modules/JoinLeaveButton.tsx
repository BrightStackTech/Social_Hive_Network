import { useState } from 'react';
import { Button } from '../ui/button';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const JoinLeaveButton = ({ className, communityName, isJoined, onJoinLeave, isRemoved, isPending }: { className?: string, communityName: string, isJoined: boolean, onJoinLeave: (communityName: string) => void, isRemoved: boolean, isPending: boolean }) => {
  const [isHovered, setIsHovered] = useState(false);
  const {token} = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  const handleJoinLeaveAction = async () => {
    setIsLoading(true);
    try {
      if (isJoined) {
        await axios.post(`${import.meta.env.VITE_SERVER_URI}/communities/${communityName}/leave`, {}, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        onJoinLeave(communityName);
      } else if (isRemoved) {
        await axios.post(`${import.meta.env.VITE_SERVER_URI}/communities/${communityName}/send-join-request`, {}, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        onJoinLeave(communityName);
      } else if (isPending) {
        await axios.post(`${import.meta.env.VITE_SERVER_URI}/communities/${communityName}/cancel-join-request`, {}, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        onJoinLeave(communityName);
      } else {
        await axios.post(`${import.meta.env.VITE_SERVER_URI}/communities/${communityName}/join`, {}, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        navigate(`/communities/c/${communityName}`);
        onJoinLeave(communityName);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Button 
        variant={isJoined || isPending ? (isHovered ? 'default' : 'outline') : 'default'}
        className={`${className} min-w-28`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleJoinLeaveAction}
        disabled={isLoading}
      >
        {isLoading ? 'Loading...' : (isJoined ? (isHovered ? '- Leave' : 'Joined') : (isRemoved ? 'Send a Join Request' : (isPending ? (isHovered ? '- Cancel Request' : 'Pending Approval') : '+ Join')))}
      </Button>
    </div>
  );
};

export default JoinLeaveButton;
