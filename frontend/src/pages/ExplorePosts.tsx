import { useState, useEffect, useRef } from 'react';
import ProfileSideBar from '@/components/sections/ProfileSideBar';
import FloatingActionButton from '@/components/modules/FloatingActionButton';
import OthersPostCard from '@/components/modules/Posts/OthersPostCard';
import { useAuth } from '@/context/AuthContext';
import { getUserFeed, getAccountsToFollow } from '@/api/index';
import PostSkeletonLoader from '@/components/modules/Posts/PostSkeletonLoader';
import { usePullToRefresh } from '@/components/modules/usePullRefreshHook';
import { Link } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import { formatDistanceToNow } from 'date-fns';
import _ from 'lodash'; // Import lodash for throttling
import MobileUserNavbar from '@/components/sections/MobileUserNavbar';
import FollowButton from '@/components/modules/FollowButton';
import axios from 'axios';

function ExplorePosts() {
  document.title = 'SocialHive - Explore';
  const [posts, setPosts] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  // const navigate = useNavigate();
  const contentDivRef = useRef<HTMLDivElement>(null);
  const [skip, setSkip] = useState(0);
  const limit = 10;
  const [hasMore, setHasMore] = useState(true);
  const [scrollPosition, setScrollPosition] = useState<number | null>(null); // Track previous scroll position
  const [accountsToFollow, setAccountsToFollow] = useState<{ _id: string; profilePicture: string; username: string; college?: string }[]>([]);
  const [accountToFollowLoading, setAccountToFollowLoading] = useState(false);
  const [followedUsersWithUpdates, setFollowedUsersWithUpdates] = useState<{ _id: string; profilePicture: string; username: string; hasUpdates: boolean; hasViewed: boolean }[]>([]);

  const getAccountRecommendations = async () => {
    if (accountsToFollow[0]) return; // Avoid duplicate fetches
    setAccountToFollowLoading(true);
    const res = await getAccountsToFollow(); // API call to fetch recommendations
    setAccountsToFollow(res.data.data); // Update state with fetched accounts
    setAccountToFollowLoading(false);
  };

  useEffect(() => {
    getAccountRecommendations();
  }, []);

  const fetchFollowedUsersWithUpdates = async () => {
    try {
      if (!user) return;
      const response = await axios.get(`/api/v1/users/following/${user.username}`);
      const followings = response.data.data; // Ensure the correct data path

      const usersWithUpdates = await Promise.all(
        followings.map(async (following: { _id: any; }) => {
          const updatesResponse = await axios.get(`${import.meta.env.VITE_SERVER_URI}/updates/${following._id}`);
          const updates = updatesResponse.data;

          const hasViewed = updates.every((update: { viewedBy: string | string[]; }) => update.viewedBy.includes(user._id));
          return { ...following, hasUpdates: updates.length > 0, hasViewed };
        })
      );

      setFollowedUsersWithUpdates(usersWithUpdates.filter(user => user.hasUpdates));
    } catch (error) {
      console.error('Error fetching followed users with updates:', error);
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const data = await getUserFeed({ limit, skip });
      if (data.data.data.length < limit) {
        setHasMore(false); // No more posts to load
      }
      setPosts((prevPosts: any) => [
        ...prevPosts,
        ...data.data.data.filter((newPost: any) => !prevPosts.some((prevPost: any) => prevPost._id === newPost._id))
      ]);
      setSkip((prevSkip) => prevSkip + limit);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
    setLoading(false);
  };

  usePullToRefresh(contentDivRef, fetchPosts);

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      fetchPosts(); // Fetch more posts when bottom is reached
    }
  };

  const scrollToTop = () => {
    const contentDiv = document.querySelector('.scrollbar-hide');
    if (contentDiv) {
      contentDiv.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    fetchFollowedUsersWithUpdates();
    fetchPosts(); // Initial fetch on mount

    // Set up auto-refresh every 100 seconds
    const intervalId = setInterval(() => {
      fetchPosts();
      scrollToTop(); // Only scroll to top on refresh
    }, 100000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  // Preserve scroll position when loading more posts, but avoid on initial mount
  useEffect(() => {
    const contentDiv = contentDivRef.current;
    if (contentDiv && scrollPosition !== null) {
      // Only set scrollTop after the initial load, when new posts are appended
      const previousScrollHeight = contentDiv.scrollHeight;
      contentDiv.scrollTop = previousScrollHeight - contentDiv.clientHeight;
    }
  }, [posts]);

  // Infinite scroll when contentDivRef is fully scrolled
  useEffect(() => {
    const handleScroll = _.throttle(() => {
      const contentDiv = contentDivRef.current;
      if (contentDiv) {
        const { scrollTop, scrollHeight, clientHeight } = contentDiv;
        // Check if the user has scrolled to the bottom
        if (scrollTop + clientHeight >= scrollHeight - 1 && hasMore && !loading) {
          setScrollPosition(scrollTop); // Save current scroll position
          handleLoadMore(); // Fetch more data when scrolled to the bottom
        }
      }
    }, 1000); // Throttle the scroll event to prevent multiple calls

    const contentDiv = contentDivRef.current;
    if (contentDiv) {
      contentDiv.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (contentDiv) {
        contentDiv.removeEventListener('scroll', handleScroll);
      }
    };
  }, [hasMore, loading]);

  return (
    <>
      {user && (
        <div className="flex">
          <div className="hidden md:block md:w-1/4 border-0 border-r-[1px] h-screen">
            <ProfileSideBar />
          </div>
          <div
            ref={contentDivRef}
            className="w-full md:w-[50%] border-0 border-r-[1px] h-screen overflow-y-auto scrollbar-hide"
            key="scrollable-content"
          >
            <MobileUserNavbar scrollableDiv={contentDivRef} />
            <div className="flex overflow-x-auto p-4 space-x-4">
              {followedUsersWithUpdates.map((user) => (
                <div key={user._id} className="flex-shrink-0 w-20 h-20 m-2 text-center">
                  <Link to={`/user/${user._id}/updates`}>
                    <div className={`w-full h-full rounded-full border-4 ${user.hasViewed ? 'border-muted' : 'border-indigo-500'}`}>
                      <img
                        src={user.profilePicture}
                        alt={user.username}
                        className={`w-full h-full rounded-full border-4 border-transparent`}
                      />
                    </div>
                    <div className="text-xs text-gray-500 truncate w-16 mt-2">
                      {user.username}
                    </div>
                  </Link>
                </div>
              ))}
            </div>
            {followedUsersWithUpdates.length > 0 && <Separator className="my-4" />}
            <div className="text-xl font-bold mx-10 my-5 text-center">
              Explore Posts
            </div>

            {/* Loading Skeleton */}
            {loading && (
              <>
                <PostSkeletonLoader />
                <PostSkeletonLoader />
                <PostSkeletonLoader />
              </>
            )}

            {/* No Posts */}
            {!loading && posts.length === 0 && (
              <div className="text-center mt-10">
                No posts to show, search or follow new content
              </div>
            )}

            {/* Display Posts */}
            {!loading &&
              posts.length > 0 &&
              posts.map((post: any, index: any) => {
                return (
                  <>
                    {post.isRepost && (
                      <div className="mx-10 w-fit bg-muted p-2 flex gap-3">
                        Reposted by{' '}
                        <Link
                          className="flex gap-2 items-center"
                          to={`/user/${post.createdBy.username}`}
                        >
                          <img
                            src={post.createdBy.profilePicture}
                            className="w-6 h-6 rounded-full"
                            alt="Profile"
                          />
                          <div>
                            {post.createdBy.username}
                          </div>
                          <Separator
                            className="bg-muted-foreground"
                            orientation="vertical"
                          />
                          <div>
                            {formatDistanceToNow(
                              post.createdAt,
                              {
                                addSuffix: true,
                              }
                            )}
                          </div>
                        </Link>
                      </div>
                    )}
                    <OthersPostCard
                      key={index}
                      otherUser={
                        post.isRepost
                          ? post.repostedPost.createdBy
                          : post.createdBy
                      }
                      post={
                        post.isRepost
                          ? post.repostedPost
                          : post
                      }
                    />
                  </>
                );
              })}
            {!hasMore
              && !loading
              && posts.length > 0 && (
                <div className="text-center my-10">
                  No more posts to show, follow more users or search
                </div>
              )}
          </div>

          <div className="hidden lg:block w-1/4 h-screen">
            <div className="text-xl font-semibold m-5 ml-2">Accounts to follow</div>

            <div className="relative flex border-y-[] flex-col  overflow-auto">
              <div className="absolute top-0 left-0 right-0 h-[60px] bg-gradient-to-b from-slate-200 dark:from-slate-800 to-transparent"></div>
              {!accountToFollowLoading &&
                accountsToFollow.map((user, index) => (
                  <div key={index} className="accountCard flex items-center justify-between gap-1 p-3 h-20 w-[95%] mx-auto border-y-[1px]">
                    <div className="flex items-center gap-1">
                      <div className="min-w-fit">
                        <img src={user.profilePicture} className="w-10 h-10 rounded-full" alt="Profile" />
                      </div>
                      <div>
                        <Link to={`/user/${user.username}`} className="font-semibold overflow-ellipsis hover:underline">
                          {user.username}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {user.college?.split('(')[1] ? '(' + user.college?.split('(')[1] : user.college}
                        </p>
                      </div>
                    </div>
                    <FollowButton userIdToFollow={user._id} className="h-3/4" />
                  </div>
                ))}
            </div>
          </div>
          <FloatingActionButton />
        </div>
      )}
    </>
  );
}

export default ExplorePosts;
