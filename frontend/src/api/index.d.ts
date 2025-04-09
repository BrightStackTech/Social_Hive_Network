declare const loginUser: (data: {
    email: string | null;
    username: string | null;
    password: string;
}) => Promise<import("axios").AxiosResponse<any, any>>;
declare const registerUser: (data: FormData) => Promise<import("axios").AxiosResponse<any, any>>;
declare const logoutUser: () => Promise<import("axios").AxiosResponse<any, any>>;
declare const getCurrentUser: () => Promise<import("axios").AxiosResponse<any, any>>;
declare const checkUsernameUnique: (username: string) => Promise<import("axios").AxiosResponse<any, any>>;
declare const updateAccountDetails: (data: {
    username: string | null;
    email: string | null;
    bio: string | null;
}) => Promise<import("axios").AxiosResponse<any, any>>;
declare const addPersonalDetails: (data: {
    phone: string | null;
    engineeringDomain: string | null;
    college: string | null;
    yearOfGraduation: string | null;
}) => Promise<import("axios").AxiosResponse<any, any>>;
declare const updateProfilePicture: (data: FormData) => Promise<import("axios").AxiosResponse<any, any>>;
declare const changePassword: (data: {
    oldPassword: string;
    newPassword: string;
}) => Promise<import("axios").AxiosResponse<any, any>>;
declare const forgotPassword: (data: {
    email: string;
}) => Promise<import("axios").AxiosResponse<any, any>>;
declare const sendVerificationEmail: () => Promise<import("axios").AxiosResponse<any, any>>;
declare const verifyEmail: (data: {
    token: string;
}) => Promise<import("axios").AxiosResponse<any, any>>;
declare const getAccountsToFollow: () => Promise<import("axios").AxiosResponse<any, any>>;
declare const createPost: (data: {
    title: string;
    content: string;
    isPublic: boolean;
    tags: string[];
    onlyFollowers: boolean;
    media: string[];
}) => Promise<import("axios").AxiosResponse<any, any>>;
declare const deletePost: (data: {
    postId: string | undefined;
}) => Promise<import("axios").AxiosResponse<any, any>>;
declare const getUserPosts: (data: {
    username: string;
}) => Promise<import("axios").AxiosResponse<any, any>>;
declare const searchUser: (data: {
    query: string;
}) => Promise<import("axios").AxiosResponse<any, any>>;
declare const getUserProfile: (data: {
    username: string | undefined;
}) => Promise<import("axios").AxiosResponse<any, any>>;
declare const resetPassword: (data: {
    token: string;
    password: string;
}) => Promise<import("axios").AxiosResponse<any, any>>;
declare const signedInResetPassword: (data: {
    token: string;
    password: string;
}) => Promise<import("axios").AxiosResponse<any, any>>;
declare const refreshToken: () => Promise<import("axios").AxiosResponse<any, any>>;
declare const followOrUnfollow: (data: {
    userId: string;
}) => Promise<import("axios").AxiosResponse<any, any>>;
declare const searchPost: (data: {
    query: string;
}) => Promise<import("axios").AxiosResponse<any, any>>;
declare const getFollowers: (data: {
    username: string | undefined;
}) => Promise<import("axios").AxiosResponse<any, any>>;
declare const getFollowing: (data: {
    username: string | undefined;
}) => Promise<import("axios").AxiosResponse<any, any>>;
declare const checkToken: () => Promise<import("axios").AxiosResponse<any, any>>;
declare const likePost: (data: {
    postId: string;
}) => Promise<import("axios").AxiosResponse<any, any>>;
declare const getUserFeed: ({ limit, skip }: {
    limit: number | undefined;
    skip: number | undefined;
}) => Promise<import("axios").AxiosResponse<any, any>>;
declare const addComment: (data: {
    postId: string | undefined;
    content: string;
}) => Promise<import("axios").AxiosResponse<any, any>>;
declare const getCommentsbyPost: (data: {
    postId: string | undefined;
}) => Promise<import("axios").AxiosResponse<any, any>>;
declare const deleteComment: (data: {
    commentId: string | undefined;
}) => Promise<import("axios").AxiosResponse<any, any>>;
declare const getPost: (data: {
    postId: string | undefined;
}) => Promise<import("axios").AxiosResponse<any, any>>;
declare const createGroup: (data: {
    groupData: any;
}) => Promise<import("axios").AxiosResponse<any, any>>;
declare const getGroup: (data: {
    groupId: string | undefined;
}) => Promise<import("axios").AxiosResponse<any, any>>;
declare const acceptRequest: (data: {
    userId: string | undefined;
    groupId: string | undefined;
}) => Promise<import("axios").AxiosResponse<any, any>>;
declare const addToGroup: (data: {
    userId: string | undefined;
    groupId: string | undefined;
}) => Promise<import("axios").AxiosResponse<any, any>>;
declare const deleteGroup: (data: {
    groupId: string | undefined;
}) => Promise<import("axios").AxiosResponse<any, any>>;
declare const exitFromGroup: (data: {
    groupId: string | undefined;
}) => Promise<import("axios").AxiosResponse<any, any>>;
declare const isGroupNameUnique: (data: {
    groupName: string;
}) => Promise<import("axios").AxiosResponse<any, any>>;
declare const rejectRequest: (data: {
    userId: string | undefined;
    groupId: string | undefined;
}) => Promise<import("axios").AxiosResponse<any, any>>;
declare const removeFromGroup: (data: {
    userId: string | undefined;
    groupId: string | undefined;
}) => Promise<import("axios").AxiosResponse<any, any>>;
declare const requestToJoinGroup: (data: {
    groupId: string | undefined;
}) => Promise<import("axios").AxiosResponse<any, any>>;
declare const addProject: (data: {
    projectData: any;
}) => Promise<import("axios").AxiosResponse<any, any>>;
declare const getGroupProjects: (data: {
    groupId: string | undefined;
}) => Promise<import("axios").AxiosResponse<any, any>>;
declare const getMyProjects: () => Promise<import("axios").AxiosResponse<any, any>>;
declare const getProject: (data: {
    projectId: string | undefined;
}) => Promise<import("axios").AxiosResponse<any, any>>;
declare const updateProject: (data: {
    projectId: string | undefined;
    updateData: any;
}) => Promise<import("axios").AxiosResponse<any, any>>;
declare const updateProjectStatus: (data: {
    projectId: string | undefined;
    status: string;
}) => Promise<import("axios").AxiosResponse<any, any>>;
declare const deleteProject: (data: {
    projectId: string | undefined;
}) => Promise<import("axios").AxiosResponse<any, any>>;
declare const createTask: (data: {
    taskData: any;
}) => Promise<import("axios").AxiosResponse<any, any>>;
declare const getTask: (data: {
    taskId: string | undefined;
}) => Promise<import("axios").AxiosResponse<any, any>>;
declare const updateTask: (data: {
    taskId: string | undefined;
    updateData: any;
}) => Promise<import("axios").AxiosResponse<any, any>>;
declare const updateTaskStatus: (data: {
    taskId: string | undefined;
    status: string;
}) => Promise<import("axios").AxiosResponse<any, any>>;
declare const deleteTask: (data: {
    taskId: string | undefined;
}) => Promise<import("axios").AxiosResponse<any, any>>;
declare const getMyGroups: () => Promise<import("axios").AxiosResponse<any, any>>;
declare const getMyTasks: (data: {
    projectId: string | undefined;
}) => Promise<import("axios").AxiosResponse<any, any>>;
declare const getOthersTasks: (data: {
    projectId: string | undefined;
}) => Promise<import("axios").AxiosResponse<any, any>>;
declare const sendNotification: (data: {
    title: string;
    body: string;
    token: string;
}) => Promise<import("axios").AxiosResponse<any, any>>;
declare const storeDeviceToken: (data: {
    token: string;
}) => Promise<import("axios").AxiosResponse<any, any>>;
declare const sendNotificationToUser: (data: {
    userId: string;
    title: string;
    body: any;
}) => Promise<import("axios").AxiosResponse<any, any>>;
declare const getGroupSuggestedPeople: (data: {
    groupId: string | undefined;
}) => Promise<import("axios").AxiosResponse<any, any>>;
declare const getGroupForVisitors: (data: {
    groupId: string | undefined;
}) => Promise<import("axios").AxiosResponse<any, any>>;
declare const getMyIndividualProjects: () => Promise<import("axios").AxiosResponse<any, any>>;
declare const updateGroupDetails: (data: {
    groupId: string | undefined;
    updateData: {
        name?: string;
        description?: string;
    };
}) => Promise<import("axios").AxiosResponse<any, any>>;
declare const changeGroupAdmin: (data: {
    groupId: string | undefined;
    userId: string | undefined;
}) => Promise<import("axios").AxiosResponse<any, any>>;
declare const createRepost: (data: {
    postId: string | undefined;
}) => Promise<import("axios").AxiosResponse<any, any>>;
declare const getLikedUsers: (data: {
    postId: string | undefined;
}) => Promise<import("axios").AxiosResponse<any, any>>;
declare const getRepostedUsers: (data: {
    postId: string | undefined;
}) => Promise<import("axios").AxiosResponse<any, any>>;
declare const getAllChats: () => Promise<import("axios").AxiosResponse<any, any>>;
declare const createOrGetOneToOneChat: (data: {
    receiverId: string | undefined;
}) => Promise<import("axios").AxiosResponse<any, any>>;
declare const sendMessage: (data: {
    content: string | undefined;
    chatId: string | undefined;
}) => Promise<import("axios").AxiosResponse<any, any>>;
declare const getAllMessages: (data: {
    chatId: string | undefined;
}) => Promise<import("axios").AxiosResponse<any, any>>;
declare const deleteMessage: (data: {
    messageId: string | undefined;
}) => Promise<import("axios").AxiosResponse<any, any>>;
declare const deleteChat: (data: {
    chatId: string | undefined;
}) => Promise<import("axios").AxiosResponse<any, any>>;
declare const searchCommunity: (data: {
    query: string;
}) => Promise<import("axios").AxiosResponse<any, any>>;
declare const searchComPosts: (data: {
    query: string;
}) => Promise<import("axios").AxiosResponse<any, any>>;
declare const sendMessageToFollower: (data: {
    username: string;
    text: string;
    title: string;
    description: string;
    url: string;
}) => Promise<import("axios").AxiosResponse<any, any>>;
declare const getUserGroups: (data: {
    userId: string;
}) => Promise<import("axios").AxiosResponse<any, any>>;
declare const sendMessageToGroup: (data: {
    groupName: string;
    text: string;
    title: string;
    description: string;
    url: string;
}) => Promise<import("axios").AxiosResponse<any, any>>;
declare const createLiveSession: (data: {
    meetingId: string;
    sessionName: string;
}) => Promise<import("axios").AxiosResponse<any, any>>;
declare const addParticipantToLiveSession: (meetingId: string) => Promise<import("axios").AxiosResponse<any, any>>;
export declare const updateRecordingURL: (meetingId: string) => Promise<unknown>;
export declare const getLiveSessionsHistory: () => Promise<import("axios").AxiosResponse<any, any>>;
declare const updateSessionTitle: (meetingId: string, payload: {
    newTitle: string;
}) => Promise<import("axios").AxiosResponse<any, any>>;
declare const updateTerminatedAt: (meetingId: string) => Promise<import("axios").AxiosResponse<any, any>>;
declare const getAnalytics: (data: {
    userId: string;
    period: string;
}) => Promise<import("axios").AxiosResponse<any, any>>;
export { refreshToken, loginUser, checkToken, registerUser, logoutUser, sendVerificationEmail, verifyEmail, getAccountsToFollow, changePassword, forgotPassword, getCurrentUser, checkUsernameUnique, createPost, createRepost, updateAccountDetails, addPersonalDetails, updateProfilePicture, getUserPosts, searchUser, getUserProfile, followOrUnfollow, searchPost, getFollowers, getFollowing, likePost, getUserFeed, addComment, deleteComment, getCommentsbyPost, getPost, createGroup, getGroup, acceptRequest, addToGroup, deleteGroup, exitFromGroup, isGroupNameUnique, rejectRequest, removeFromGroup, requestToJoinGroup, deletePost, addProject, getGroupProjects, getMyProjects, getProject, updateProject, updateProjectStatus, deleteProject, createTask, getTask, updateTask, updateTaskStatus, deleteTask, getMyGroups, getMyTasks, getOthersTasks, sendNotification, storeDeviceToken, sendNotificationToUser, getGroupSuggestedPeople, getGroupForVisitors, getMyIndividualProjects, updateGroupDetails, changeGroupAdmin, getLikedUsers, getRepostedUsers, getAllChats, createOrGetOneToOneChat, sendMessage, getAllMessages, deleteMessage, deleteChat, resetPassword, signedInResetPassword, searchCommunity, searchComPosts, sendMessageToFollower, getUserGroups, sendMessageToGroup, createLiveSession, addParticipantToLiveSession, updateSessionTitle, updateTerminatedAt, getAnalytics };
