import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Loader from '@/components/Loader';
import MobileUserNavbar from '@/components/sections/MobileUserNavbar';
import ComSearchBar from '@/components/modules/ComSearchBar';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import CommunitiesActionButton from '@/components/modules/CommunitiesActionButton';
import ComPostCard from '@/components/modules/ComPostCard'; 
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { ExternalLink } from 'lucide-react';
import { formatDate } from '@/utils/formatDate';
import JoinLeaveButton from '@/components/modules/JoinLeaveButton';
import ManageRequests from '@/components/modules/ManageRequests';

interface Community {
  communityName: string;
  description: string;
  profilePicture: string;
  admin: { _id: string; username: string };
  joinedBy: { _id: string; username: string; profilePicture: string; bio: string }[];
  joinedCount: number;
  removedMem: string[];
  pendingReq: string[];
  composts: any[]; // Define a more specific type if possible
  createdAt: string;
}

const CommunityProfilePage: React.FC = () => {
  const { communityName } = useParams<{ communityName: string }>();
  const [community, setCommunity] = useState<Community | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const scrollableDiv = useRef<HTMLDivElement>(null);
  const [showPreview, setShowPreview] = useState(false);
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState("All Posts");
  const [memberToRemove, setMemberToRemove] = useState<any>(null);
  const decodedCommunityName = decodeURIComponent(communityName || '');
  const [unjoinedCommunities, setUnjoinedCommunities] = useState<any[]>([]);
  const isRemoved = community ? community?.removedMem.includes(user?._id ?? '') : false;
  const isPending = community ? community?.pendingReq.includes(user?._id ?? '') : false;
  const [joinedCommunities, setJoinedCommunities] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [resizableHeight, setResizableHeight] = useState(50); 

  useEffect(() => {
    document.title = "SocialHive- Communities";
    const fetchCommunity = async () => {
      try {
        const response = await axios.get(`/api/v1/communities/${decodedCommunityName}`);
        setCommunity(response.data.data);
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

    const fetchCompostsByCommunityName = async () => {
      try {
        const response = await axios.get(`/api/v1/composts/community-name/${communityName}`);
        setCommunity((prevCommunity: Community | null) => ({
          ...prevCommunity!,
          composts: response.data,
        }));
      } catch (error) {
        console.error('Error fetching composts:', error);
      }
    };

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
    const fetchJoinedCommunities = async () => {
      try {
        const response = await axios.get('/api/v1/communities/joined-communities', {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        });
        setJoinedCommunities(response.data.data);
      } catch (error) {
        console.error('Error fetching joined communities:', error);
      }
    };

    fetchCommunity();
    fetchUnjoinedCommunities();
    fetchJoinedCommunities();
    fetchCompostsByCommunityName();
  }, [decodedCommunityName, navigate, user?.token]);

  const handleJoinLeave = (_communityName: any) => {
    const fetchCommunity = async () => {
      try {
        const response = await axios.get(`/api/v1/communities/${decodedCommunityName}`);
        setCommunity(response.data.data);
        if (!isJoined) {
          //navigate(`/communities/c/${decodedCommunityName}`);
        }
      } catch (error) {
        console.error('Error fetching community:', error);
      }
    };

    fetchCommunity();
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      await axios.delete(`/api/v1/communities/${decodedCommunityName}/remove/${userId}`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });
      handleJoinLeave(decodedCommunityName);
      setMemberToRemove(null); // Close the dialog
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Error removing member:', error.response?.data);
      } else {
        console.error('Error removing member:', error);
      }
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    navigate(`/com-search?query=${(e.target as HTMLInputElement).value}`);
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    navigate(`/com-search?query=${(e.target as HTMLFormElement).value}`);
  };

  if (loading) {
    return <Loader />;
  }

  if (!community) {
    return <div className='text-2xl font-semibold text-center'>Community not found</div>;
  }

  const isProfileTabSelected = decodeURIComponent(window.location.pathname) === `/communities/c/${decodedCommunityName}`;
  const isEditTabSelected = decodeURIComponent(window.location.pathname) === `/communities/c/${decodedCommunityName}/edit`;
  const isJoined = community?.joinedBy.some((member: any) => member._id === user?._id);
  const isAdmin = user?._id === community?.admin._id;

  const renderPosts = () => {
    if (!community) return null;

    let sortedPosts = [...community?.composts]; // Changed from community?.posts to community?.composts

    if (selectedTab === "Top Posts") {
      sortedPosts.sort((a, b) => b.pointsCount - a.pointsCount);
    } else if (selectedTab === "Old Posts") {
      sortedPosts.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else {
      sortedPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return sortedPosts.map((post: any, index: any) => (
      <ComPostCard key={index} post={post} />
    ));
  };

  const handleSearchChange1 = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredJoinedCommunities = joinedCommunities.filter((community) =>
    community?.communityName.toLowerCase().includes(searchQuery.toLowerCase())
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
    <div className="flex w-full h-screen overflow-hidden">
      <div className="flex flex-col w-full lg:w-2/3">
        <MobileUserNavbar scrollableDiv={scrollableDiv} />
        {user && (
          <nav className="flex justify-between items-center p-4 bg-muted w-full border-0 border-b-2 border-muted-foreground">
            <ComSearchBar onChange={handleSearchChange} onSubmit={handleSearchSubmit} />
          </nav>
        )}
        <div className="flex-1 overflow-y-auto">
          {isAdmin && (
            <div className="flex w-full">
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
                onClick={() => navigate(`/communities/c/${decodedCommunityName}/edit`)}
              >
                Edit Community Profile
              </div>
            </div>
          )}
          <div className="mt-4">
            <Dialog>
              <div className="m-3 mx-auto w-44 rounded-full h-44">
                <DialogTrigger>
                  <img
                    onMouseEnter={() => {
                      setShowPreview(true);
                    }}
                    onMouseLeave={() => {
                      setShowPreview(false);
                    }}
                    src={community?.profilePicture || "/path/to/default-logo.png"}
                    className="mx-auto rounded-full border-[7px] w-44 h-44 border-muted hover:opacity-50 dark:hover:opacity-25 cursor-pointer"
                    alt="Community Logo"
                  />
                  <ExternalLink
                    className={`w-10 cursor-pointer absolute top-[40%] hover:opacity-100 left-[40%] h-10 ${
                      showPreview ? "opacity-100" : "opacity-0"
                    }`}
                  />
                </DialogTrigger>
                <DialogContent className="bg-transparent border-0">
                  <img
                    src={community?.profilePicture || "/path/to/default-logo.png"}
                    className="w-full h-full"
                    alt="Community Logo"
                  />
                </DialogContent>
              </div>
            </Dialog>
          </div>
          <div className="text-center font-bold text-lg">c/{community?.communityName}</div>
          <div className="text-center text-sm m-3 text-muted-foreground">{community?.description}</div>
          <div className="flex justify-between w-full px-8 mt-2">
            <div className="text-sm text-muted-foreground">Created on: {formatDate(community?.createdAt)}</div>
            <div className="text-sm text-muted-foreground">
              Admin: <Link to={`/user/${community?.admin.username}`} className="text-blue-500 hover:underline">{community?.admin.username}</Link>
            </div>
          </div>
          <div className="flex justify-between w-full px-8 mt-2">
            <Dialog>
              <DialogTrigger>
                <div className="text-sm text-muted-foreground cursor-pointer">{community?.joinedCount} Members Joined</div>
              </DialogTrigger>
              <DialogContent>
                <div className="text-center text-lg">Members Joined</div>
                <div className="flex flex-col mt-3 gap-2 max-h-[70vh] overflow-y-auto">
                  {community?.joinedBy.map((member: any) => (
                    <div key={member._id} className="flex items-center justify-between cursor-pointer hover:bg-muted p-2 gap-2">
                      <div className="flex items-center gap-2" onClick={() => navigate(`/user/${member.username}`)}>
                        <img src={member.profilePicture} className="w-10 h-10 rounded-full" alt="" />
                        <div className="flex flex-col">
                          <div className="font-bold">{member.username}</div>
                          <div className="text-sm text-muted-foreground line-clamp-1">{member.bio}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                          {community && member._id === community?.admin._id && (
                            <div className="text-green-500 text-xs">Admin</div>
                          )}
                          {community && isAdmin && member._id !== community?.admin._id && (
                            <div className="text-red-500 text-xs cursor-pointer" onClick={(e) => { e.stopPropagation(); setMemberToRemove(member); }}>Remove</div>
                          )}
                      </div>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
              {community && isAdmin && <ManageRequests communityName={decodedCommunityName} />}
              {community && !isAdmin && (
                <JoinLeaveButton
                  className="min-w-20 max-h-10"
                  communityName={decodedCommunityName}
                  isJoined={isJoined}
                  isRemoved={isRemoved}
                  isPending={isPending}
                  onJoinLeave={() => handleJoinLeave(decodedCommunityName)}
                />
              )}
          </div>
          <div className="w-full h-[2px] bg-muted mt-5"></div>
            <div className="posts w-full">
              <div className={`profile-tabs bg-gray-200 sticky top-0 duration-300 z-[9999] dark:bg-gray-700 text-gray-800 dark:text-gray-200 w-full`}>
                <ul className="flex justify-center md:gap-6">
                  <li className={`cursor-pointer hover:text-blue-500 duration-150 p-2 md:px-4 m-2 ${
                    selectedTab === "All Posts" && "bg-muted  font-bold hover:text-gray-500"
                  }`}
                  onClick={() => setSelectedTab("All Posts")}
                  >All Posts</li>
                  <li className={`cursor-pointer hover:text-blue-500 duration-150 p-2 md:px-4 m-2 ${
                    selectedTab === "Top Posts" && "bg-muted  font-bold hover:text-gray-500"
                  }`}
                  onClick={() => setSelectedTab("Top Posts")}
                  >Top Posts</li>
                  <li className={`cursor-pointer hover:text-blue-500 duration-150 p-2 md:px-4 m-2 ${
                    selectedTab === "New Posts" && "bg-muted  font-bold hover:text-gray-500"
                  }`}
                  onClick={() => setSelectedTab("New Posts")}
                  >New Posts</li>
                  <li className={`cursor-pointer hover:text-blue-500 duration-150 p-2 md:px-4 m-2 ${
                    selectedTab === "Old Posts" && "bg-muted  font-bold hover:text-gray-500"
                  }`}
                  onClick={() => setSelectedTab("Old Posts")}
                  >Old Posts</li>
                </ul>
              </div>
              <div className="mt-4 mx-4">
                {renderPosts()}
              </div>
            </div>
        </div>
      </div>
      <div className="hidden lg:flex flex-col w-1/3 h-screen overflow-hidden border-l-[1px]">
        <div className="text-xl font-semibold m-5 ml-2">Top Communities</div>
        <div className="relative flex border-y-[] flex-col overflow-auto" style={{ height: `${100 - resizableHeight}%` }}>
          {unjoinedCommunities.map((community) => (
            <div key={community?._id} className="accountCard flex items-center justify-between gap-1 p-3 h-14 w-[95%] mx-auto border-y-[1px]">
              <div className="flex items-center gap-1">
                <div className="min-w-fit">
                  <img src={community?.profilePicture} className="w-10 h-10 rounded-full" alt={community?.communityName} />
                </div>
                <div>
                  <Link to={`/communities/c/${community?.communityName}`} className="font-semibold overflow-ellipsis hover:underline">
                    {community?.communityName}
                  </Link>
                  <p className="text-xs text-muted-foreground">{community?.description}</p>
                </div>
              </div>
              <JoinLeaveButton
                communityName={community?.communityName}
                isJoined={false}
                isRemoved={community?.removedMem.includes(user?._id)}
                isPending={community?.pendingReq.includes(user?._id)}
                onJoinLeave={() => handleJoinLeave(community?.communityName)}
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
            value={searchQuery}
            onChange={handleSearchChange1}
            className="w-[95%] mx-auto p-2 border border-muted rounded mb-4 mt-4 bg-transparent"
          />
          {filteredJoinedCommunities.map((community) => (
            <div key={community?._id} className="accountCard flex items-center justify-between gap-1 p-3 h-14 w-[95%] mx-auto border-y-[1px]">
              <div className="flex items-center gap-1">
                <div className="min-w-fit">
                  <img src={community?.profilePicture} className="w-10 h-10 rounded-full" alt={community?.communityName} />
                </div>
                <div>
                  <Link to={`/communities/c/${community?.communityName}`} className="font-semibold overflow-ellipsis hover:underline">
                    {community?.communityName}
                  </Link>
                  <p className="text-xs text-muted-foreground">{community?.description}</p>
                </div>
              </div>
              <JoinLeaveButton
                communityName={community?.communityName}
                isJoined={true}
                isRemoved={community?.removedMem?.includes(user?._id)}
                isPending={community?.pendingReq?.includes(user?._id)}
                onJoinLeave={() => handleJoinLeave(community?.communityName)}
              />
            </div>
          ))}
        </div>
      </div>
      <CommunitiesActionButton />
      {memberToRemove && (
        <Dialog open={true} onOpenChange={() => setMemberToRemove(null)}>
          <DialogContent>
            <div className="text-center text-lg">Are you sure you want to remove {memberToRemove.username}?</div>
            <div className="flex justify-center gap-4 mt-4">
              <Button variant="outline" onClick={() => setMemberToRemove(null)}>Cancel</Button>
              <Button variant="destructive" onClick={() => handleRemoveMember(memberToRemove._id)}>Remove</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default CommunityProfilePage;