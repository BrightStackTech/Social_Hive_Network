import React, { useState, useRef, useEffect } from 'react';
import ProfileSideBar from '@/components/sections/ProfileSideBar';
import { useAuth } from '@/context/AuthContext';
import { searchCommunity, searchComPosts } from '@/api/index';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Loader from '@/components/Loader';
import ComPostCard from '@/components/modules/ComPostCard';
import MobileUserNavbar from '@/components/sections/MobileUserNavbar';
import ComSearchBar from '@/components/modules/ComSearchBar';

function ComSearchPage() {
  document.title = "SocialHive - Community Search";
  const { user } = useAuth();
  const [communitySearchResults, setCommunitySearchResults] = useState<any[]>([]);
  const [compostSearchResults, setCompostSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedTab, setSelectedTab] = useState('communities');
  const scrollableDiv = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const query = new URLSearchParams(location.search).get('query') || '';

  useEffect(() => {
    const fetchSearchResults = async () => {
      setSearched(true);
      setLoading(true);
      try {
        const communityRes = await searchCommunity({ query });
        const compostRes = await searchComPosts({ query });
        setCommunitySearchResults(communityRes.data.communities || []);
        setCompostSearchResults(compostRes.data.posts || []);
      } catch (error) {
        console.error('Error fetching search results:', error);
        setCommunitySearchResults([]);
        setCompostSearchResults([]);
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      fetchSearchResults();
    }
  }, [query]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    navigate(`/com-search?query=${e.target.value}`);
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    navigate(`/com-search?query=${query}`);
  };

  return (
    <div>
      {user && (
        <div className='flex'>
          <div className="hidden md:block md:w-1/4 border-0 border-r-[1px] h-screen">
            <ProfileSideBar />
          </div>
          <div ref={scrollableDiv} className="w-full md:w-[50%] overflow-y-scroll scrollbar-hide border-0 border-r-[1px] h-screen">
            <MobileUserNavbar scrollableDiv={scrollableDiv} />
            <div className='mt-5'></div>
            <ComSearchBar onChange={handleChange} onSubmit={onSubmit} />
            {searched && loading && <div className="text-xl font-semibold m-5 ml-2"><Loader /></div>}
            <div className="flex">
              <div className="w-full">
                {searched && (
                  <div className="flex mt-2">
                    <button
                      className={`px-4 py-2 font-semibold w-1/2 border-0 border-r-gray-700 ${selectedTab === 'communities' ? 'bg-muted border-0 border-b-2 border-blue-500 border-r-[1px] text-white' : ''}`}
                      onClick={() => setSelectedTab('communities')}
                    >
                      Communities
                    </button>
                    <button
                      className={`px-4 py-2 font-semibold w-1/2 border-l-gray-700 ${selectedTab === 'composts' ? 'bg-muted border-0 border-b-2 border-blue-500 text-white border-l-[1px]' : ''}`}
                      onClick={() => setSelectedTab('composts')}
                    >
                      Community Posts
                    </button>
                  </div>
                )}
                {selectedTab === 'communities' && searched && !loading && communitySearchResults.length === 0 && (
                  <div className='text-center m-10 text-lg font-bold'>No results found</div>
                )}
                {selectedTab === 'communities' && !loading && communitySearchResults.length > 0 && (
                  <div>
                    {communitySearchResults.map((result: any) => (
                      <Link to={`/communities/c/${result.communityName}`} className="flex gap-2 items-center p-3 hover:bg-muted duration-150" key={result._id}>
                        <img src={result.profilePicture} width={10} height={10} className="w-10 h-10 rounded-full" />
                        <div className="flex flex-col justify-center p-2">
                            <div className="text-xl">{result.communityName}</div>
                            <div className="text-sm text-gray-400">{result.description}</div>
                        </div>

                      </Link>
                    ))}
                  </div>
                )}
                {selectedTab === 'composts' && searched && compostSearchResults.length === 0 && (
                  <div className='text-center m-10 text-lg font-bold'>No results found</div>
                )}
                {selectedTab === 'composts' && compostSearchResults.length > 0 && (
                  <div>
                    {compostSearchResults.map((result: any) => (
                        <div className="ml-4 mr-4 mt-4">
                            <ComPostCard key={result._id} post={result} />
                        </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ComSearchPage;