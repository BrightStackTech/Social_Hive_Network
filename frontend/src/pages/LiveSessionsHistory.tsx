import React, { useEffect, useState, useRef } from "react";
import { getLiveSessionsHistory, updateSessionTitle as apiUpdateSessionTitle } from "@/api/index";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import { FaPencilAlt, FaCheck, FaTimes } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProfileSideBar from "@/components/sections/ProfileSideBar";
import MobileUserNavbar from "@/components/sections/MobileUserNavbar";

interface Participant {
  _id: string;
  username: string;
}

interface LiveSessionHistory {
  meetingId: string;
  createdAt: string;
  participants: Participant[];
  recordings: string[];
  title: string; // Session name from database
}

const LiveSessionsHistory = () => {
  // Added "date" to sortKey union.
  const [sessions, setSessions] = useState<LiveSessionHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<"title" | "meetingId" | "createdAt" | "date" | "participants">("title");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [tempTitle, setTempTitle] = useState<string>(""); // Temporary title for editing
  const { user } = useAuth();
  const scrollableDiv = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await getLiveSessionsHistory();
        const dataWithTitles = res.data.data.map((session: any) => ({
          ...session,
          title: session.title ? session.title : "Untitled session",
        }));

        // Sort sessions by createdAt in descending order (newer first)
        const sortedData: LiveSessionHistory[] = dataWithTitles.sort(
          (a: LiveSessionHistory, b: LiveSessionHistory) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setSessions(sortedData);
      } catch (error) {
        console.error("Error fetching session history", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const handleTitleChange = (index: number, newTitle: string) => {
    const updatedSessions = [...sessions];
    updatedSessions[index].title = newTitle;
    setSessions(updatedSessions);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
  };

  const handleSort = (key: "title" | "meetingId" | "createdAt" | "date" | "participants") => {
    let order: "asc" | "desc" = "asc";
    if (sortKey === key && sortOrder === "asc") {
      order = "desc";
    }
    setSortKey(key);
    setSortOrder(order);

    const sortedSessions = [...sessions].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (key === "participants") {
        aValue = a.participants.length;
        bValue = b.participants.length;
      } else if (key === "date") {
        // Compare only the date part
        aValue = new Date(a.createdAt).setHours(0, 0, 0, 0);
        bValue = new Date(b.createdAt).setHours(0, 0, 0, 0);
      } else if (key === "createdAt") {
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
      } else {
        aValue = a[key];
        bValue = b[key];
      }

      if (aValue < bValue) return order === "asc" ? -1 : 1;
      if (aValue > bValue) return order === "asc" ? 1 : -1;
      return 0;
    });

    setSessions(sortedSessions);
  };

  // Add created date (locale date string) to search filtering
  const filteredSessions = sessions.filter((session) =>
    session.title.toLowerCase().includes(searchQuery) ||
    session.meetingId.toLowerCase().includes(searchQuery) ||
    new Date(session.createdAt).toLocaleDateString().toLowerCase().includes(searchQuery) ||
    session.createdAt.toLowerCase().includes(searchQuery) ||
    session.participants.some((p) => p.username.toLowerCase().includes(searchQuery))
  );

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setTempTitle(sessions[index].title);
  };

  const cancelEditing = () => {
    setEditingIndex(null);
    setTempTitle("");
  };

  const saveTitle = async (index: number) => {
    if (!tempTitle.trim()) {
      toast.error("Session name can't be empty!");
      return;
    }
    try {
      const meetingId = sessions[index].meetingId;
      // Call API to update title in the database
      await apiUpdateSessionTitle(meetingId, { newTitle: tempTitle });
      // Update the UI on success
      handleTitleChange(index, tempTitle);
      toast.success("Session name updated successfully!");
    } catch (error) {
      toast.error("Failed to update session name");
      console.error("Update session title error:", error);
    }
    setEditingIndex(null);
    setTempTitle("");
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="w-screen">
      <ToastContainer />
      {user && (
        <div className="flex">
          {/* Left Sidebar */}
          <div className="hidden md:block md:w-1/4 border-0 border-r-[1px] h-screen">
            <ProfileSideBar />
          </div>
          {/* Main Content */}
          <div ref={scrollableDiv} className="w-full md:w-3/4 overflow-y-scroll scrollbar-hide border-0 h-screen">
            <MobileUserNavbar scrollableDiv={scrollableDiv} />
            <h1 className="text-4xl font-bold mb-4 mt-10 mx-10">Live Sessions History</h1>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mt-8 mx-10">
              {/* Search Bar */}
              <input
                type="text"
                placeholder="Search..."
                className="w-full p-2 mb-4 border rounded bg-gray-900 dark:border-gray-600"
                onChange={handleSearch}
              />
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse bg-white dark:bg-black">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-700">
                      <th
                        className="px-4 py-2 border cursor-pointer"
                        onClick={() => handleSort("title")}
                      >
                        Session Name
                      </th>
                      <th
                        className="px-4 py-2 border cursor-pointer"
                        onClick={() => handleSort("meetingId")}
                      >
                        Session ID
                      </th>
                      {/* Split Created At into two columns */}
                      <th
                        className="px-4 py-2 border cursor-pointer"
                        onClick={() => handleSort("date")}
                      >
                        Date
                      </th>
                      <th
                        className="px-4 py-2 border"
                      >
                        Time
                      </th>
                      <th
                        className="px-4 py-2 border cursor-pointer"
                        onClick={() => handleSort("participants")}
                      >
                        Participants
                      </th>
                      <th className="px-4 py-2 border">Recordings</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSessions.length > 0 ? (
                      filteredSessions.map((session, index) => (
                        <tr key={session.meetingId} className="border-b">
                          <td className="px-4 py-2 border">
                            <div className="flex items-center group">
                              {/* Only allow editing if current user is the first participant */}
                              {editingIndex === index ? (
                                <div className="flex items-center">
                                  <input
                                    type="text"
                                    value={tempTitle}
                                    onChange={(e) => setTempTitle(e.target.value)}
                                    className="border rounded mr-2 bg-transparent font-bold w-40"
                                    style={{
                                      color: tempTitle.toLowerCase() === "untitled session" ? "rgb(156,163,175)" : "white",
                                    }}
                                  />
                                  <FaCheck
                                    className="text-green-500 cursor-pointer ml-2"
                                    onClick={() => saveTitle(index)}
                                  />
                                  <FaTimes
                                    className="text-red-500 cursor-pointer ml-2"
                                    onClick={cancelEditing}
                                  />
                                </div>
                              ) : (
                                <>
                                  <span className={`font-bold ${session.title.toLowerCase() === "untitled session" ? "text-gray-600" : "text-white"}`}>
                                    {session.title}
                                  </span>
                                  {session.participants.length > 0 &&
                                    session.participants[0]._id === user._id && (
                                      <FaPencilAlt
                                        className="text-gray-500 cursor-pointer ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                        onClick={() => startEditing(index)}
                                      />
                                    )}
                                </>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-2 border">{session.meetingId}</td>
                          {/* New columns for Date and Time */}
                          <td className="px-4 py-2 border">
                            {new Date(session.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-2 border">
                            {new Date(session.createdAt).toLocaleTimeString()}
                          </td>
                          <td className="px-4 py-2 border">
                            {session.participants && session.participants.length > 0 ? (
                              session.participants.map((participant) => (
                                <div key={participant._id}>
                                  <Link to={`/user/${participant.username}`} className="text-orange-400 hover:underline">
                                    {participant.username}
                                  </Link>
                                </div>
                              ))
                            ) : (
                              <span>No participants</span>
                            )}
                          </td>
                          <td className="px-4 py-2 border">
                            {session.recordings && session.recordings.length > 0 ? (
                              session.recordings.map((url, index) => (
                                <div key={index}>
                                  <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                    Recording {index + 1}
                                  </a>
                                </div>
                              ))
                            ) : (
                              <span>No recordings</span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="text-center font-bold py-4">
                          No sessions found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveSessionsHistory;