import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import MobileUserNavbar from "@/components/sections/MobileUserNavbar";
import ComSearchBar from "@/components/modules/ComSearchBar";
import CommunitiesActionButton from "@/components/modules/CommunitiesActionButton";
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import JoinLeaveButton from '@/components/modules/JoinLeaveButton';
import ComPostCard from '@/components/modules/ComPostCard';
import ComPostSkeletonLoader from '@/components/modules/ComPostSkeletonLoader'; // Import ComPostSkeletonLoader
import LoadingWheel from '@/components/ui/LoadingWheel'; // Import LoadingWheel
import Loader from '@/components/Loader';

const CommunitiesPage = () => {
  const { user } = useAuth();
  const [unjoinedCommunities, setUnjoinedCommunities] = useState<any[]>([]);
  const [communitiesFeed, setCommunitiesFeed] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const [pulling, setPulling] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults] = useState([]);
  const [searchLoading] = useState(false);
  const [searched] = useState(false);
  const navigate = useNavigate();
  const [joinedCommunities, setJoinedCommunities] = useState<any[]>([]);
  const [searchQuery1, setSearchQuery1] = useState('');
  const [resizableHeight, setResizableHeight] = useState(50);

  useEffect(() => {
    document.title = "SocialHive- Communities";

    const fetchUnjoinedCommunities = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_SERVER_URI}/communities/unjoined-communities`, {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        });
        setUnjoinedCommunities(response.data.data || []);
      } catch (error) {
        console.error('Error fetching unjoined communities:', error);
      }
    };

    const fetchCommunitiesFeed = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_SERVER_URI}/composts/user-feed`, {
                headers: {
                    Authorization: `Bearer ${user?.token}`,
                },
            });
            const feedData = response.data.data ? response.data.data : response.data;
            setCommunitiesFeed(Array.isArray(feedData) ? feedData : []);
        } catch (error) {
            console.error('Error fetching communities feed:', error);
        } finally {
            setLoading(false);
        }
    };
    
    const fetchJoinedCommunities = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_SERVER_URI}/communities/joined-communities`, {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        });
        setJoinedCommunities(response.data.data || []);
      } catch (error) {
        console.error('Error fetching joined communities:', error);
      }
    };

    fetchUnjoinedCommunities();
    fetchJoinedCommunities();
    fetchCommunitiesFeed();
  }, [user?.token]);

  const handleJoinLeave = (communityName: string) => {
    setUnjoinedCommunities(prev => prev.filter(community => community.communityName !== communityName));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentY = e.touches[0].clientY;
    if (currentY - startY.current > 50) {
      setPulling(true);
    }
  };

  const handleTouchEnd = () => {
    if (pulling) {
      setRefreshing(true);
      setPulling(false);
      window.location.reload();
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    navigate(`/com-search?query=${searchQuery}`);
  };

  // Group composts by community
  const groupedComposts = communitiesFeed.reduce((acc: any, post: any) => {
    const communityName = post.community?.communityName || 'Unknown community';
    if (!acc[communityName]) {
      acc[communityName] = [];
    }
    acc[communityName].push(post);
    return acc;
  }, {});

  // Separate joined and unjoined community posts
  const joinedCommunityPosts: any[] = [];
  const unjoinedCommunityPosts: any[] = [];


  Object.keys(groupedComposts).forEach(communityName => {
    const posts = groupedComposts[communityName];
    if (unjoinedCommunities.some((c) => c.communityName === communityName)) {
      unjoinedCommunityPosts.push({ communityName, posts });
    } else {
      joinedCommunityPosts.push(...posts);
    }
  });

  let maxPosts = 0;
  unjoinedCommunityPosts.forEach((community) => {
    if (community.posts.length > maxPosts) {
      maxPosts = community.posts.length;
    }
  });
  const rounds = Math.ceil(maxPosts / 3);

  const chunkedSections: { 
    communityName: string;
    posts: any[];
  }[] = [];

  for (let roundIndex = 0; roundIndex < rounds; roundIndex++) {
    for (let i = 0; i < unjoinedCommunityPosts.length; i++) {
      const communityObj = unjoinedCommunityPosts[i];
      const start = roundIndex * 3;
      const end = start + 3;
      const chunk = communityObj.posts.slice(start, end);
      if (chunk.length > 0) {
        chunkedSections.push({
          communityName: communityObj.communityName,
          posts: chunk,
        });
      }
    }
  }

  const handleSearchChange1 = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery1(e.target.value);
  };

  const filteredJoinedCommunities = joinedCommunities.filter((community) =>
    community?.communityName.toLowerCase().includes(searchQuery1.toLowerCase())
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    const startY = e.clientY;
    const startHeight = resizableHeight;

    const onMouseMove = (e: MouseEvent) => {
      const deltaY = startY - e.clientY; // Reverse the calculation
      const newHeight = startHeight + (deltaY / window.innerHeight) * 100;
      setResizableHeight(Math.min(Math.max(newHeight, 20), 80)); // Limit height between 20% and 80%
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  return (
    <div className="flex w-full" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
      <div className="flex flex-col items-center w-full lg:w-2/3">
        <MobileUserNavbar scrollableDiv={null} />
        {user && (
          <nav className="flex justify-between items-center p-4 bg-muted w-full border-0 border-b-2 border-muted-foreground">
            <ComSearchBar onChange={handleSearchChange} onSubmit={handleSearchSubmit} />
          </nav>
        )}
        {refreshing && <LoadingWheel />}
        <div className="flex-1 overflow-y-auto w-full h-full p-3" style={{ maxHeight: 'calc(115vh - 200px)' }}>
          {loading && (
            <>
              <ComPostSkeletonLoader />
              <ComPostSkeletonLoader />
              <ComPostSkeletonLoader />
            </>
          )}
          {searched && searchLoading && <div className="text-xl font-semibold m-5 ml-2"><Loader /></div>}
          {searched && !searchLoading && searchResults.length === 0 && (
            <div className='text-center m-10 text-lg font-bold'>No results found</div>
          )}
          {searched && !searchLoading && searchResults.length > 0 && (
            <div>
              {searchResults.map((result: any) => (
                <Link to={`/community/${result.communityName}`} className="flex gap-2 items-center p-3 hover:bg-muted duration-150" key={result._id}>
                  <img src={result.profilePicture} width={10} height={10} className="w-10 h-10 rounded-full" />
                  <div>{result.communityName}</div>
                </Link>
              ))}
            </div>
          )}
          {!searched && joinedCommunityPosts.length > 0 && (
            <div>
              {joinedCommunityPosts.map((post) => (
                <ComPostCard key={post._id} post={post} />
              ))}
            </div>
          )}
          {!searched && unjoinedCommunityPosts.length === 0 && joinedCommunityPosts.length === 0 && (
            <div className="flex justify-center items-center h-full">
              <p className="text-center text-2xl font-semibold w-[70%]">
                No more Community posts found
              </p>
            </div>
          )}
          {!searched && chunkedSections.map((section, index) => {
            // Choose a background color based on index if you like
            const bgClass = index % 2 === 0 
              ? 'bg-gray-300 dark:bg-gray-900' 
              : 'bg-blue-200 dark:bg-black';

            // Figure out isRemoved / isPending from your original unjoinedCommunityPosts array
            const matchedComm = unjoinedCommunityPosts.find(
              (c) => c.communityName === section.communityName
            );
            const isRemoved = matchedComm?.removedMem?.includes(user?._id);
            const isPending = matchedComm?.pendingReq?.includes(user?._id);

            return (
              <div key={section.communityName + '-' + index} className={`p-4 ${bgClass}`}>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-sm text-center">
                    To get similar posts like these join community{" "}
                    <Link 
                      to={`/communities/c/${section.communityName}`} 
                      className="text-orange-500 hover:underline"
                    >
                      {section.communityName}
                    </Link>
                  </h2>
                  <JoinLeaveButton
                    communityName={section.communityName}
                    isJoined={false}
                    isRemoved={isRemoved}
                    isPending={isPending}
                    onJoinLeave={() => handleJoinLeave(section.communityName)}
                  />
                </div>

                {/* Render these 3 (or fewer) posts for this chunk */}
                {section.posts.map((post: any) => (
                  <ComPostCard key={post._id} post={post} />
                ))}
              </div>
            );
          })}
        </div>
      </div>
      <div className="hidden lg:block w-1/3 h-screen overflow-auto border-l-[1px]">
        <div className="text-xl font-semibold m-5 ml-2">Top Communities</div>
        <div className="relative flex border-y-[] flex-col overflow-auto" style={{ height: `${100 - resizableHeight}%` }}>
          {unjoinedCommunities?.map((community) => (
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
        <div
          className="cursor-row-resize bg-gray-300 dark:bg-gray-700 h-2"
          onMouseDown={handleMouseDown}
        ></div>
        <div className="relative flex flex-col overflow-auto" style={{ height: `${resizableHeight}%` }}>
          <div className="text-xl font-semibold m-5 ml-2">Joined Communities</div>
          <input
            type="text"
            placeholder="Search joined communities..."
            value={searchQuery1}
            onChange={handleSearchChange1}
            className="w-[95%] mx-auto p-2 border border-muted rounded mb-4 mt-4 bg-transparent"
          />
          {filteredJoinedCommunities.map((community) => (
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
                isJoined={true}
                isRemoved={community.removedMem.includes(user?._id)}
                isPending={community.pendingReq.includes(user?._id)}
                onJoinLeave={() => handleJoinLeave(community.communityName)}
              />
            </div>
          ))}
        </div>
      </div>
      <CommunitiesActionButton />
    </div>
  );
};

export default CommunitiesPage;
