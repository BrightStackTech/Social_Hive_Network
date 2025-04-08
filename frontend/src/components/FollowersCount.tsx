import React, { useEffect, useState } from "react";
import axios from "axios";

type FollowersCountProps = {
  // We assume the API endpoint uses the user's username;
  // alternatively, you could pass userId and adjust your API accordingly.
  username: string;
};

const FollowersCount: React.FC<FollowersCountProps> = ({ username }) => {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    if (!username) return;
    const fetchFollowersCount = async () => {
      try {
        // This example assumes your endpoint returns an object like:
        // { data: { data: [ { _id: ..., username: ... }, … ] } }
        const response = await axios.get(`/api/v1/users/followers/${username}`);
        // Set count to the length of the returned followers array.
        setCount(response.data.data.length);
      } catch (error) {
        console.error("Failed to fetch followers count:", error);
      }
    };

    fetchFollowersCount();

    // If live updates are desired, you could also set an interval or use a subscription.
    // For example, to poll every minute uncomment the following:
    // const interval = setInterval(fetchFollowersCount, 60000);
    // return () => clearInterval(interval);
  }, [username]);

  return (
    <div className="text-center">
      <p className="text-4xl font-bold">{count}</p>
      <p className="text-lg">Followers</p>
    </div>
  );
};

export default FollowersCount;