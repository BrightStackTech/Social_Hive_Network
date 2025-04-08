import { AxiosResponse } from "axios";
import { getToken } from "firebase/messaging";
import { messaging } from "../firebase/firebaseConfig";
import { storeDeviceToken } from "@/api/index";
import { ChatInterface } from "@/types";
import { UserInterface } from "@/context/AuthContext";
export const requestHandler = async (
    api: () => Promise<AxiosResponse<any>>,
    setLoading: ((loading: boolean) => void) | null,
    onSuccess: (data: any) => void,
    onError: (error: string) => void
  ) => {
    // Show loading state if setLoading function is provided
    setLoading && setLoading(true);
    try {
      // Make the API request
      const response = await api();
      const { data } = response;
      if (data?.success) {
        // Call the onSuccess callback with the response data
        onSuccess(data);
      }
    } catch (error: any) {
      // Handle error cases, including unauthorized and forbidden cases
      if ([401,403].includes(error?.response.status)) {
        localStorage.clear(); // Clear local storage on authentication issues
        // if (isBrowser) window.location.href = "/login"; // Redirect to login page
      }
      onError(error);
    } finally {
      // Hide loading state if setLoading function is provided
      setLoading && setLoading(false);
    }
  };
  export const isBrowser = typeof window !== "undefined";
  export function formatNumber(num:number) {
    if (num >= 1_000_000) {
      return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    } else if (num >= 1_000) {
      return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
    } else {
      return num.toString();
    }
  }
  export async function requestPermission() {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token =await getToken(messaging, {
        vapidKey:import.meta.env.VITE_APP_VAPID_KEY
      })
      await storeDeviceToken({token})
      
    } else {
      alert('Notification permission denied.');
    }
}
  

  export const getChatObjectMetadata = (
    chat: ChatInterface, // The chat item for which metadata is being generated.n
    loggedInUser: UserInterface // The currently logged-in user details.
  ) => {
    // Determine the content of the last message, if any.
    // If the last message contains only attachments, indicate their count.
    const lastMessageDetails = chat?.lastMessageDetails?.[0];
const sender = lastMessageDetails?.sender;

const lastMessage = lastMessageDetails
  ? `${sender?._id === loggedInUser?._id ? "You: " : `${sender?.username}: `}${lastMessageDetails.content}`
  : "No messages yet"; // Placeholder text if there are no messages.
  
    if (chat.isGroupChat) {
      // Case: Group chat
      // Return metadata specific to group chats.
      return {
        // Default avatar for group chats.
        profilePicture: "https://res.cloudinary.com/dxygc9jz4/image/upload/t_color-white/enifyimlrv3farvfto8k.jpg",
        title: chat.name, // Group name serves as the title.
        description: `${chat.participants.length} members in the chat`, // Description indicates the number of members.
        lastMessage: lastMessage,
        lastMessageDetails,
        _id: chat._id
      };
    } else {
      // Case: Individual chat
      // Identify the participant other than the logged-in user.
      const participant = chat.participants.find(
        (p) => p._id !== loggedInUser?._id
      );
      // Return metadata specific to individual chats.
      return {
        profilePicture: participant?.profilePicture, // Participant's avatar URL.
        title: participant?.username, // Participant's username serves as the title.
        description: participant?.email, // Email address of the participant.
        lastMessage,
        lastMessageDetails,
        _id: chat._id
      };
    }
  };
  
