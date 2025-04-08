import React, { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProfileSideBar from "@/components/sections/ProfileSideBar";
import MobileUserNavbar from "@/components/sections/MobileUserNavbar";
import { getAnalytics } from "@/api"; // getAnalytics should call your analytics endpoint
import { useAuth } from "@/context/AuthContext";
import FollowTrendGraph from "@/components/FollowTrendGraph";
import axios from "axios"; // ensure axios is imported
import PostCard from "@/components/modules/Posts/PostCard";

// Components to display graphs respectively.
import FollowersCount from "@/components/FollowersCount"; 
import InteractionGraph from "@/components/InteractionGraph";
import MultiLineGraph from "@/components/MultiLineGraph";

const ProfileAnalytics = () => {
  const pathname = window.location.pathname;
  const scrollableDiv = useRef<HTMLDivElement>(null);
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);
  const [period, setPeriod] = useState("weekly");
  const { user } = useAuth();
  // New state to hold top and lowest posts data
  const [topPosts, setTopPosts] = useState<any[]>([]);
    const [lowestPosts, setLowestPosts] = useState<any[]>([]);
    
  // Fetch analytics data from the Analytics model.
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // This function should call an endpoint that returns analytics records for the given time period.
        const response = await getAnalytics({ userId: user?._id ?? "", period });
        setAnalyticsData(response.data);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      }
    };

    if (user?._id) {
      fetchAnalytics();
    }
  }, [period, user?._id]);
    
    // New useEffect to fetch top posts and lowest posts from analytics router endpoints
    useEffect(() => {
    const fetchPosts = async () => {
        try {
        // Adjust these values as needed.
        const topResponse = await axios.get("/api/v1/analytics/top-posts", {
        params: { period, type: "likes" }
        });
        setTopPosts(topResponse.data.data);
        const lowestResponse = await axios.get("/api/v1/analytics/lowest-posts", {
        params: { period, type: "likes" }
        });
        setLowestPosts(lowestResponse.data.data);
        } catch (error) { console.error("Error fetching top/lowest posts:", error);}
        };
        fetchPosts();
    }, [period]);

    
  // Compute averages from the analytics model records.
  const getAverage = (key: string) => {
    if (analyticsData.length === 0) return 0;
    const total = analyticsData.reduce((sum, record) => sum + (record[key] || 0), 0);
    return total / analyticsData.length;
  };

  const avgLikes = getAverage("totalLikes");
  const avgComments = getAverage("totalComments");
  const avgShares = getAverage("totalShares");

 return (
    <div className="flex">
      <div className="hidden md:block md:w-1/4 border-r h-screen">
        <ProfileSideBar />
      </div>
      <div ref={scrollableDiv} className="w-full md:w-3/4 overflow-y-scroll h-screen">
        <MobileUserNavbar scrollableDiv={scrollableDiv} />
        <div className="flex border-b">
          <Link
            to="/profile"
            className={`w-1/3 py-5 text-center cursor-pointer ${
              pathname === "/profile"
                ? "font-bold text-lg bg-muted border-b-4 border-blue-500"
                : "hover:bg-slate-900 duration-200"
            }`}
          >
            Profile
          </Link>
          <Link
            to="/editProfile"
            className={`w-1/3 py-5 text-center cursor-pointer ${
              pathname === "/editProfile"
                ? "font-bold text-lg bg-muted border-b-4 border-blue-500"
                : "hover:bg-slate-900 duration-200"
            }`}
          >
            Edit Profile
          </Link>
          <div
            className={`w-1/3 py-5 text-center cursor-pointer ${
              pathname === "/profile-analytics"
                ? "font-bold text-lg bg-muted border-b-4 border-blue-500"
                : "hover:bg-slate-900 duration-200"
            }`}
          >
            Analytics
          </div>
        </div>
        <div className="p-4">
          <label htmlFor="period-select" className="mr-2">Select Period:</label>
          <select
            id="period-select"
            onChange={(e) => setPeriod(e.target.value)}
            value={period}
            className="p-2 border rounded bg-gray-100 dark:bg-gray-900"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
        {/* Live Followers Count Section */}
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold mb-2">Live Followers Count</h2>
          <FollowersCount username={user?.username || ""} />
        </div>
        {/* Follow-Unfollow Trend */}
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold mb-2">Follow Trend</h2>
          <FollowTrendGraph
            period={period}
            data={analyticsData.map((record) => ({
              date: record.date,
              follows: record.follows,
              unfollows: record.unfollows,
            }))}
          />
        </div>
        {/* Interactions Graphs Section */}
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold mb-2">Interactions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="font-semibold">Average Likes</h3>
              <InteractionGraph
                title="Avg Likes"
                value={avgLikes}
                period={period}
                data={analyticsData.map((record) => ({
                  date: record.date,
                  value: record.totalLikes,
                }))}
              />
            </div>
            <div>
              <h3 className="font-semibold">Average Comments</h3>
              <InteractionGraph
                title="Avg Comments"
                value={avgComments}
                period={period}
                data={analyticsData.map((record) => ({
                  date: record.date,
                  value: record.totalComments,
                }))}
              />
            </div>
            <div>
              <h3 className="font-semibold">Average Shares</h3>
              <InteractionGraph
                title="Avg Shares"
                value={avgShares}
                period={period}
                data={analyticsData.map((record) => ({
                  date: record.date,
                  value: record.totalShares,
                }))}
              />
            </div>
          </div>
        </div>
        {/* MultiLine Graph for overall interactions */}
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold mb-2">Overall Interactions</h2>
          <MultiLineGraph
            period={period}
            data={analyticsData.map((record) => ({
                date: record.date,
                likes: record.totalLikes,
                comments: record.totalComments,
                shares: record.totalShares,
            }))}
          />
        </div>
        {/* New Section: Display Top Posts */}
        {/* <div className="p-4 border-b">
          <h2 className="text-xl font-bold mb-2">Top Posts</h2>
          {topPosts.length === 0 ? (
            <div>No top posts found.</div>
          ) : (
            topPosts.map((post) => (
              <div key={post._id} className="p-2 border rounded my-2">
                <div className="font-bold">{post.title}</div>
                <div>{post.content.slice(0, 100)}...</div>
              </div>
            ))
          )}
        </div> */}
        {/* New Section: Display Lowest Posts */}
        {/* <div className="p-4">
          <h2 className="text-xl font-bold mb-2">Lowest Posts</h2>
          {lowestPosts.length === 0 ? (
            <div>No lowest posts found.</div>
          ) : (
            lowestPosts.map((post) => (
              <div key={post._id} className="p-2 border rounded my-2">
                <div className="font-bold">{post.title}</div>
                <div>{post.content.slice(0, 100)}...</div>
              </div>
            ))
          )}
        </div> */}
      </div>
    </div>
  );
};

export default ProfileAnalytics;