import React, { useEffect, useState } from 'react';
import ComSearchBar from '@/components/modules/ComSearchBar';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';
// import { Button } from '@/components/ui/button';
import axios from 'axios';
import JoinLeaveButton from '@/components/modules/JoinLeaveButton';

const CommunityNotFound: React.FC = () => {
  const { user } = useAuth();
  const [unjoinedCommunities, setUnjoinedCommunities] = useState<any[]>([]);

  useEffect(() => {
    const fetchUnjoinedCommunities = async () => {
      try {
        const response = await axios.get('/api/v1/communities/unjoined-communities', {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        });
        setUnjoinedCommunities(response.data.data);
      } catch (error) {
        console.error('Error fetching unjoined communities:', error);
      }
    };

    fetchUnjoinedCommunities();
  }, [user?.token]);

  const handleJoinLeave = (communityName: string) => {
    setUnjoinedCommunities(prev => prev.map(community => 
      community.communityName === communityName 
        ? { ...community, isJoined: !community.isJoined, isPending: !community.isPending } 
        : community
    ));
  };

  return (
    <div className="flex w-full">
      <div className="flex flex-col items-center w-full lg:w-2/3">
        <nav className="flex justify-between items-center p-4 bg-muted w-full border-0 border-b-2 border-muted-foreground">
          <ComSearchBar onChange={function (_e: React.ChangeEvent<HTMLInputElement>): void {
            throw new Error('Function not implemented.');
          } } onSubmit={function (_e: React.FormEvent<HTMLFormElement>): void {
            throw new Error('Function not implemented.');
          } } />
        </nav>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Community Not Found</h1>
            <p className="text-lg text-muted-foreground">The community you are looking for does not exist.</p>
          </div>
        </div>
      </div>
      <div className="hidden lg:block w-1/3 h-screen overflow-auto border-l-[1px]">
        <div className="text-xl font-semibold m-5 ml-2">Top Communities</div>
        <div className="relative flex border-y-[] flex-col overflow-auto">
          {unjoinedCommunities.map((community) => (
            <div key={community._id} className="accountCard flex items-center justify-between gap-1 p-3 h-14 w-[95%] mx-auto border-y-[1px]">
              <div className="flex items-center gap-1">
                <div className="min-w-fit">
                  <img src={community.profilePicture} className="w-10 h-10 rounded-full" alt={community.communityName} />
                </div>
                <div>
                  <Link to={`/communities/c/${community.communityName}`} className="font-semibold overflow-ellipsis hover:underline">
                    {community.communityName}
                  </Link>
                  <p className="text-xs text-muted-foreground">{community.description}</p>
                </div>
              </div>
              <JoinLeaveButton
                communityName={community.communityName}
                isJoined={false}
                isRemoved={community.removedMem.includes(user?._id)}
                isPending={community.pendingReq.includes(user?._id)}
                onJoinLeave={() => handleJoinLeave(community.communityName)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommunityNotFound;