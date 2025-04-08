export const DB_NAME = "Social_Hive_Network"
export const postKeywords = [
    // General categories
    "admissions", "campus", "events", "exams", "internships", 
    "faculty", "hostel", "library", "sports", "canteen", "festivals", "workshops", 
    "clubs", "societies", "student life", "college life", "extra-curricular", 
  
    // Academics
    "syllabus", "attendance", "assignments", "projects", "labs", "courses", 
    "study material", "lectures", "results", "cgpa", "scholarships",
  
    // Career-related
    "jobs", "internships", "placements", "recruiters", "career guidance", 
    "skill development", "interview tips", "coding competitions", 
  
    // Reviews and feedback
    "professor review", "course review", "college review", "infrastructure", 
    "facilities", "feedback", "pros", "cons", "recommendations", 
  
    // College-specific activities
    "fests", "hackathons", "cultural events", "sports meet", "debates", 
    "seminars", "webinars", "industry visits", "alumni meet",
  
    // Location and logistics
    "transport", "hostel", "mess", "wifi", "security", "rentals", "neighborhood", 
    "commute", "facilities",
  
    // Social and emotional aspects
    "friendships", "networking", "memories", "college stories", "challenges", 
    "motivation", "stress management", "mental health",
  
    // Miscellaneous
    "library", "research", "scholarships", "campus tours", "part-time jobs",
    "volunteering", "college traditions"
];

export const ChatEventEnum = Object.freeze({
    // ? once user is ready to go
    CONNECTED_EVENT: "connected",
    // ? when user gets disconnected
    DISCONNECT_EVENT: "disconnect",
    // ? when user joins a socket room
    JOIN_CHAT_EVENT: "joinChat",
    // ? when participant gets removed from group, chat gets deleted or leaves a group
    LEAVE_CHAT_EVENT: "leaveChat",
    // ? when admin updates a group name
    UPDATE_GROUP_NAME_EVENT: "updateGroupName",
    // ? when new message is received
    MESSAGE_RECEIVED_EVENT: "messageReceived",
    // ? when there is new one on one chat, new group chat or user gets added in the group
    NEW_CHAT_EVENT: "newChat",
    // ? when there is an error in socket
    SOCKET_ERROR_EVENT: "socketError",
    // ? when participant stops typing
    STOP_TYPING_EVENT: "stopTyping",
    // ? when participant starts typing
    TYPING_EVENT: "typing",
    // ? when message is deleted
    MESSAGE_DELETE_EVENT: "messageDeleted",
  });
  
  export const AvailableChatEvents = Object.values(ChatEventEnum);