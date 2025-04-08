import React, { useEffect, useState, useRef } from 'react';
import { useSocket } from '@/context/SocketContext';
import { getAllChats, sendMessage, getAllMessages, deleteMessage, deleteChat, sendMessageToFollower, sendMessageToGroup, getAccountsToFollow } from '@/api/index';
import { ArrowLeft, EllipsisVertical } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ChatInterface, ChatMessageInterface } from '@/types';
import { getChatObjectMetadata, requestHandler } from '@/utils';
import { useAuth } from '@/context/AuthContext';
import AddChatModal from '@/components/modules/AddChatModal';
import { Button } from '@/components/ui/button';
import {
  FaPaperPlane, FaImage, FaImages, FaPaperclip,
  FaTimes, FaFileAlt, FaFilePdf, FaFileWord,
  FaFileAudio, FaFileVideo, FaFilePowerpoint,
  FaFileExcel, FaSpinner, FaCheckDouble, FaFile,
  FaMicrophone, FaStop, FaPlay, FaPause, FaRecordVinyl, FaSearch, FaArrowUp,
  FaArrowDown, FaPhoneAlt, FaCamera,
  FaVideo, FaFolderOpen
} from 'react-icons/fa';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from '@/components/ui/context-menu';
import Loader from '@/components/Loader';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ChatEventEnums } from '@/constants';
import MobileUserNavbar from '@/components/sections/MobileUserNavbar';
import { toast } from 'react-toastify';
import parse from 'html-react-parser';
import axios from 'axios';
import { Dialog, DialogContent, DialogClose, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import { format, formatDistanceToNow } from 'date-fns';
import AWS from 'aws-sdk/global';
import S3 from 'aws-sdk/clients/s3';
import { getFollowers, createOrGetOneToOneChat } from '@/api/index';
import { UserInterface } from '@/context/AuthContext';

if (typeof global === 'undefined') {
  window.global = window;
}
declare global {
  interface Window {
    downloadFile: (url: string, fileName: string) => void;
    handleViewFile: (url: string, fileName: string) => void;
    handleClickLink:(url:string) => void;
  }
}

const MESSAGE_LENGTH_LIMIT = 100;

function Chat() {
  document.title = 'SocialHive - Chats';
  const { socket } = useSocket();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [chats, setChats] = useState<any[]>([]);
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessageInterface[]>([]);
  const [unreadMessages, setUnreadMessages] = useState<ChatMessageInterface[]>([]);
  const currentChat = useRef<ChatInterface | null>(null);
  const [selectedMessage, setSelectedMessage] = useState('');
  const [isContextOpen, setIsContextOpen] = useState(false);
  const [chatsSearch, setChatsSearch] = useState<string>('');
  const [chatsLoading, setChatsLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const scrollableDiv = useRef<HTMLDivElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImageUploading, setIsImageUploading] = useState<boolean>(false);
  const [readMessages, setReadMessages] = useState<Set<string>>(new Set());
  const [unreadChats, setUnreadChats] = useState<Set<string>>(new Set());
  const [isReceiverOnline, setIsReceiverOnline] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
  const [currentSearchIndex, setCurrentSearchIndex] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [documentLinks, setDocumentLinks] = useState<string[]>([]);
  const [isDocumentBoxOpen, setIsDocumentBoxOpen] = useState(false);
  const [imageLinks, setImageLinks] = useState<string[]>([]);
  const [videoLinks, setVideoLinks] = useState<string[]>([]);
  const [audioLinks, setAudioLinks] = useState<string[]>([]);
  const { username } = useParams();
  const [followers, setFollowers] = useState<UserInterface[]>([]);
  const [replyMessage, setReplyMessage] = useState<ChatMessageInterface | null>(null);
  
  
  const extractDocumentLinks = () => {
  const documentPattern = new RegExp(
    `^https://${import.meta.env.VITE_AWS_BUCKET_NAME}\\.s3\\.${import.meta.env.VITE_AWS_REGION}\\.amazonaws\\.com\\/`
  );
  const links = messages
    .filter((message) => documentPattern.test(message.content))
    .map((message) => message.content);
  setDocumentLinks(links);
  };
  const extractImageLinks = () => {
  const imagePattern = new RegExp(
    `https://res\\.cloudinary\\.com\\/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}\\/image\\/upload\\/[-A-Z0-9+&@#/%?=~_|!:,.;]*`,
    'gi'
  );
  const links = messages
    .filter((message) => imagePattern.test(message.content))
    .map((message) => message.content);
  setImageLinks(links);
};

const extractVideoLinks = () => {
  const videoPattern = new RegExp(
    `https://res\\.cloudinary\\.com\\/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}\\/video\\/upload\\/[-A-Z0-9+&@#/%?=~_|!:,.;]*\\.(mp4|mov|ogg)`,
    'gi'
  );
  const links = messages
    .filter((message) => videoPattern.test(message.content))
    .map((message) => message.content);
  setVideoLinks(links);
};

const extractAudioLinks = () => {
  const audioPattern = new RegExp(
    `https://res\\.cloudinary\\.com\\/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}\\/video\\/upload\\/[-A-Z0-9+&@#/%?=~_|!:,.;]*\\.webm`,
    'gi'
  );
  const links = messages
    .filter((message) => audioPattern.test(message.content))
    .map((message) => message.content);
  setAudioLinks(links);
};

const DocumentList = ({ links }: { links: string[] }) => {
  const getDisplayName = (url: string) => {
    const decodedUrl = decodeURIComponent(url);
    const urlParts = decodedUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    const cleanedFileName = fileName.replace(/^\d+_/, '');
    const fileNamePattern = new RegExp(`filename=([^&]+)`);
    const match = fileNamePattern.exec(decodedUrl);
    return match ? decodeURIComponent(match[1]) : cleanedFileName;
  };

  const handleViewFile = (url: string, fileName: string) => {
    const MicrosoftFileExtensions = ['.doc', '.docx', '.ppt', '.xlsx', '.pptx', 'xls'];
    const isMicrosoftFile = MicrosoftFileExtensions.some(ext => fileName.endsWith(ext));
    const new1 = "https://view.officeapps.live.com/op/view.aspx?src=";
    if (isMicrosoftFile) {
      window.open(`${new1}${url}`, '_blank');
    } else {
      window.open(url, '_blank');
    }
  };

  const sortedLinks = [...links].reverse();

  return (
    <div className="document-list">
      <h3 style={{ fontWeight: 'bold', fontSize: '1.5em', marginBottom: '16px' }}>Documents</h3>
      {sortedLinks.length === 0 ? (
        <p style={{ textAlign: 'center', fontStyle: 'italic', color: 'grey' }}>No Documents to display</p>
      ) : (
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          <ul>
            {sortedLinks.map((link, index) => {
              const displayName = getDisplayName(link);
              return (
                <React.Fragment key={index}>
                  <li style={{ marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handleViewFile(link, displayName);
                      }}
                      style={{ display: 'flex', alignItems: 'center' }}
                    >
                      <span
                        dangerouslySetInnerHTML={{ __html: getFileIconHtml(displayName) }}
                        style={{ marginRight: '8px' }}
                      />
                      {displayName}
                    </a>
                  </li>
                  {index < sortedLinks.length - 1 && <hr style={{ margin: '16px 0' }} />}
                </React.Fragment>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

const ImageList = ({ links }: { links: string[] }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const sortedLinks = [...links].reverse();

  return (
    <div>
      <h3 style={{ fontWeight: 'bold', fontSize: '1.5em', marginBottom: '16px' }}>Images</h3>
      {sortedLinks.length === 0 ? (
        <p style={{ textAlign: 'center', fontStyle: 'italic', color: 'grey' }}>No Images to display</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', maxHeight: '400px', overflowY: 'auto' }}>
          {sortedLinks.map((link, index) => (
            <img
              key={index}
              src={link}
              alt={`Image ${index + 1}`}
              style={{ width: '100%', height: '150px', objectFit: 'cover', cursor: 'pointer' }}
              onClick={() => setSelectedImage(link)}
            />
          ))}
        </div>
      )}
      {selectedImage && (
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="bg-transparent border-0">
            <img src={selectedImage} alt="Selected" style={{ width: '100%' }} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

const VideoList = ({ links }: { links: string[] }) => {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  const sortedLinks = [...links].reverse();

  return (
    <div>
      <h3 style={{ fontWeight: 'bold', fontSize: '1.5em', marginBottom: '16px' }}>Videos</h3>
      {sortedLinks.length === 0 ? (
        <p style={{ textAlign: 'center', fontStyle: 'italic', color: 'grey' }}>No Videos to display</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', maxHeight: '400px', overflowY: 'auto' }}>
          {sortedLinks.map((link, index) => (
            <video
              key={index}
              controls
              style={{ width: '100%', height: '150px', objectFit: 'cover', cursor: 'pointer' }}
              onClick={() => setSelectedVideo(link)}
            >
              <source src={link} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ))}
        </div>
      )}
      {selectedVideo && (
        <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
          <DialogContent className="bg-transparent border-0">
            <video controls style={{ width: '100%' }}>
              <source src={selectedVideo} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

const AudioList = ({ links }: { links: string[] }) => {
  const sortedLinks = [...links].reverse();

  return (
    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
      <h3 style={{ fontWeight: 'bold', fontSize: '1.5em', marginBottom: '16px' }}>Audios</h3>
      {sortedLinks.length === 0 ? (
        <p style={{ textAlign: 'center', fontStyle: 'italic', color: 'grey' }}>No Audios to display</p>
      ) : (
        sortedLinks.map((link, index) => (
          <React.Fragment key={index}>
            <audio controls style={{ width: '100%', marginBottom: '16px' }}>
              <source src={link} type="audio/webm" />
              Your browser does not support the audio element.
            </audio>
            {index < sortedLinks.length - 1 && <hr style={{ margin: '16px 0' }} />}
          </React.Fragment>
        ))
      )}
    </div>
  );
};
  
const tabs = [
  {
    label: "Documents",
    content: <DocumentList links={documentLinks} />,
  },
  {
    label: "Images",
    content: <ImageList links={imageLinks} />,
  },
  {
    label: "Videos",
    content: <VideoList links={videoLinks} />,
  },
  {
    label: "Audios",
    content: <AudioList links={audioLinks} />,
  },
  // Add more tabs as needed
];

  const toggleOptions = () => {
    setIsOpen(!isOpen);
  };


  const handleSearchClick = () => {
    setIsSearchVisible(!isSearchVisible);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

const handleSearch = () => {
  if (!searchText.trim()) return; 

  const cloudinaryPattern = new RegExp(`https://res.cloudinary.com/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload/[-A-Z0-9+&@#\/%?=~_|!:,.;]*`, 'gi');
  const urlPattern = new RegExp(`^https://${import.meta.env.VITE_AWS_BUCKET_NAME}\\.s3\\.${import.meta.env.VITE_AWS_REGION}\\.amazonaws\\.com\\/`);
  const cloudinaryVideoPattern = new RegExp(`https://res.cloudinary.com/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/video/upload/[-A-Z0-9+&@#\/%?=~_|!:,.;]*\\.(mp4|mov|ogg)`, 'gi');
  const cloudinaryAudioPattern = new RegExp(`https://res.cloudinary.com/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/video/upload/[-A-Z0-9+&@#\/%?=~_|!:,.;]*\.webm`, 'gi');

  const recentMessageIndex = messages.findIndex((message) => {
    const content = message.content.toLowerCase();
    return content.includes(searchText.toLowerCase()) &&
      !cloudinaryPattern.test(content) &&
      !urlPattern.test(content) &&
      !cloudinaryVideoPattern.test(content) &&
      !cloudinaryAudioPattern.test(content);
  });

  if (recentMessageIndex !== -1) {
    const recentMessageElement = document.getElementById(`message-${recentMessageIndex}`);
    if (recentMessageElement) {
      setHighlightedMessageId(messages[recentMessageIndex]._id);
      recentMessageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => {
        setHighlightedMessageId(null); // Remove highlight after blinking
      }, 1250);

      setCurrentSearchIndex(recentMessageIndex);
    }
  }
};

const handleSearchUp = () => {
  if (!searchText.trim()) return;

  const cloudinaryPattern = new RegExp(`https://res.cloudinary.com/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload/[-A-Z0-9+&@#\/%?=~_|!:,.;]*`, 'gi');
  const urlPattern = new RegExp(`^https://${import.meta.env.VITE_AWS_BUCKET_NAME}\\.s3\\.${import.meta.env.VITE_AWS_REGION}\\.amazonaws\\.com\\/`);
  const cloudinaryVideoPattern = new RegExp(`https://res.cloudinary.com/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/video/upload/[-A-Z0-9+&@#\/%?=~_|!:,.;]*\\.(mp4|mov|ogg)`, 'gi');
  const cloudinaryAudioPattern = new RegExp(`https://res.cloudinary.com/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/video/upload/[-A-Z0-9+&@#\/%?=~_|!:,.;]*\.webm`, 'gi');

  let searchIndex = currentSearchIndex;
  if (searchIndex === null) {
    searchIndex = messages.length; // Start from the last message if no prior search
  }

  const previousIndex = messages
    .slice(0, searchIndex)
    .reverse()
    .findIndex((message) => {
      const content = message.content.toLowerCase();
      return content.includes(searchText.toLowerCase()) &&
        !cloudinaryPattern.test(content) &&
        !urlPattern.test(content) &&
        !cloudinaryVideoPattern.test(content) &&
        !cloudinaryAudioPattern.test(content);
    });

  if (previousIndex !== -1) {
    const newIndex = searchIndex - previousIndex - 1;
    const previousMessageElement = document.getElementById(`message-${newIndex}`);
    if (previousMessageElement) {
      setHighlightedMessageId(messages[newIndex]._id);
      previousMessageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

      setTimeout(() => {
        setHighlightedMessageId(null); // Remove highlight after blinking
      }, 1250);

      setCurrentSearchIndex(newIndex);
    }
  }
};

const handleSearchDown = () => {
  if (!searchText.trim()) return;

  const cloudinaryPattern = new RegExp(`https://res.cloudinary.com/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload/[-A-Z0-9+&@#\/%?=~_|!:,.;]*`, 'gi');
  const urlPattern = new RegExp(`^https://${import.meta.env.VITE_AWS_BUCKET_NAME}\\.s3\\.${import.meta.env.VITE_AWS_REGION}\\.amazonaws\\.com\\/`);
  const cloudinaryVideoPattern = new RegExp(`https://res.cloudinary.com/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/video/upload/[-A-Z0-9+&@#\/%?=~_|!:,.;]*\\.(mp4|mov|ogg)`, 'gi');
  const cloudinaryAudioPattern = new RegExp(`https://res.cloudinary.com/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/video/upload/[-A-Z0-9+&@#\/%?=~_|!:,.;]*\.webm`, 'gi');

  let searchIndex = currentSearchIndex;
  if (searchIndex === null) {
    searchIndex = -1; // Start from the first message if no prior search
  }

  const nextIndex = messages
    .slice(searchIndex + 1)
    .findIndex((message) => {
      const content = message.content.toLowerCase();
      return content.includes(searchText.toLowerCase()) &&
        !cloudinaryPattern.test(content) &&
        !urlPattern.test(content) &&
        !cloudinaryVideoPattern.test(content) &&
        !cloudinaryAudioPattern.test(content);
    });

  if (nextIndex !== -1) {
    const newIndex = searchIndex + nextIndex + 1;
    const nextMessageElement = document.getElementById(`message-${newIndex}`);
    if (nextMessageElement) {
      setHighlightedMessageId(messages[newIndex]._id);
      nextMessageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

      setTimeout(() => {
        setHighlightedMessageId(null); // Remove highlight after blinking
      }, 1250);

      setCurrentSearchIndex(newIndex);
    }
  }
};


const handleCopyMessage = async (content: string) => {
    const cloudinaryPattern = new RegExp(`https://res.cloudinary.com/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload/[-A-Z0-9+&@#\/%?=~_|!:,.;]*`, 'gi');
    const urlPattern = new RegExp(`^https://${import.meta.env.VITE_AWS_BUCKET_NAME}\\.s3\\.${import.meta.env.VITE_AWS_REGION}\\.amazonaws\\.com\\/`);
    const linkPattern = /^https:\/\//;
    const anchorTagPattern = /<a[^>]*href="([^"]+)"[^>]*>(https:\/\/[^<]+)<\/a>/;
    const emailAnchorTagPattern = /<a[^>]*href="https:\/\/mail\.google\.com\/mail\/\?view=cm&fs=1&to=([^"]+)"[^>]*>([^<]+)<\/a>/;

    let linkToCopy = content;
    if (emailAnchorTagPattern.test(content)) {
        const match = content.match(emailAnchorTagPattern);
        if (match && match[1]) {
            linkToCopy = match[1];
        }
    } else if (anchorTagPattern.test(content)) {
        const match = content.match(anchorTagPattern);
        if (match && match[2]) {
            linkToCopy = match[2];
        }
    }

    if (cloudinaryPattern.test(content)) {
        try {
            const response = await fetch(content, { mode: 'cors' });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const blob = await response.blob();
            const imageBitmap = await createImageBitmap(blob);
            const canvas = document.createElement('canvas');
            canvas.width = imageBitmap.width;
            canvas.height = imageBitmap.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                throw new Error('Failed to get canvas context');
            }
            ctx.drawImage(imageBitmap, 0, 0);
            canvas.toBlob(async (pngBlob) => {
                if (pngBlob) {
                    const item = new ClipboardItem({ 'image/png': pngBlob });
                    await navigator.clipboard.write([item]);
                    //alert('Image copied to clipboard');
                } else {
                    throw new Error('Failed to convert image to PNG');
                }
            }, 'image/png');
        } catch (error) {
            console.error('Error copying image:', error);
            alert('Failed to copy image to clipboard');
        }
    } else if (urlPattern.test(content)) {
        toast.info("Copy option is not available for this type of message.", { theme: "colored" });
        return;
    } else if (linkPattern.test(linkToCopy)) {
        try {
            await navigator.clipboard.writeText(linkToCopy);
            console.log('Link copied to clipboard:', linkToCopy);
        } catch (error) {
            console.error('Failed to copy the link:', error);
        }
    } else {
        navigator.clipboard.writeText(content).then(() => {
            //alert('Text copied to clipboard');
        }).catch((error) => {
            console.error('Error copying text:', error);
            alert('Failed to copy text to clipboard');
        });
    }
};

 
  const handleViewProfile = (chatDetails: any) => {
    const requestedChat = chats.find((chat) => chat._id == chatDetails._id);
    const link = requestedChat.isGroupChat ? `/groups/${requestedChat.group}` : `/user/${chatDetails.title}`;
    navigate(link);
  };

  const handleDeleteChat = (e: React.MouseEvent, chat: ChatInterface) => {
    e.stopPropagation();
    if (currentChat.current?._id == chat._id) currentChat.current = null;
    deleteChat({ chatId: chat._id }).then(() => {
      setChats((prev) => prev.filter((c) => c._id != chat._id));
    });
  };

  const handleOnChatClick = (clickedChat: ChatInterface) => {
      const chatDetails = getChatObjectMetadata(clickedChat, user!);
      const username = chatDetails?.title;
      if (username) {
        navigate(`/chat/${username}`);
      }
    if (currentChat.current?._id == clickedChat._id) return;
    setMessages([]);
    currentChat.current = clickedChat;
    setMessagesLoading(true);
    socket?.emit(ChatEventEnums.JOIN_CHAT_EVENT, clickedChat._id);
    getAllMessages({ chatId: currentChat.current._id })
      .then((res) => {
        setMessages(res.data.data);
        setMessagesLoading(false);
      })
      .catch((err) => {
        if (err.status == 402) {
          setMessages([]);
        } else toast.error('Something went wrong, please try again later');
        setMessagesLoading(false);
      });

    setUnreadMessages((prev) => prev.filter((msg) => msg.chat != clickedChat._id));
  };

  useEffect(() => {
    if (user?.username) {
      getFollowers({ username: user.username }).then((res) => {
        setFollowers(res.data.data);
      });
    }
  }, [user]);

  useEffect(() => {
    if (username) {
      const chat = chats.find((chat) => getChatObjectMetadata(chat, user!)?.title === username);
      if (chat) {
        handleOnChatClick(chat);
      } else {
        const receiverId = followers.find((follower: UserInterface) => follower.username === username)?._id;
        if (receiverId) {
          createOrGetOneToOneChat({ receiverId }).then((res) => {
            const newChat = res.data.data;
            setChats((prev: ChatInterface[]) => [newChat, ...prev]);
            handleOnChatClick(newChat);
          });
        } else if (!receiverId && username !== null) {
          //toast.error("The user you are trying to chat hasn't followed you yet");
        }
      }
    }
  }, [username, chats, followers]);

  const updateChatLastMessageOnDeletion = (
    chatToUpdateId: string, //ChatId to find the chat
    message: ChatMessageInterface //The deleted message
  ) => {
    // Search for the chat with the given ID in the chats array
    const chatToUpdate = chats.find((chat) => chat._id === chatToUpdateId)!;

    //Updating the last message of chat only in case of deleted message and chats last message is same
    if (chatToUpdate.lastMessage === message._id) {
      requestHandler(
        async () => getAllMessages({ chatId: chatToUpdate._id }),
        null,
        (req) => {
          const { data } = req;
          chatToUpdate.lastMessageDetails[0] = data[data.length - 1];
          chatToUpdate.lastMessage = data[data.length - 1]._id;
          setChats([...chats]);
        },
        alert
      );
    }
  };

  const updateChatLastMessage = (
    chatToUpdateId: string,
    message: ChatMessageInterface // The new message to be set as the last message
  ) => {
    // Search for the chat with the given ID in the chats array
    const chatToUpdate = chats.find((chat) => chat._id === chatToUpdateId)!;
    // Update the 'lastMessage' field of the found chat with the new message
    chatToUpdate.lastMessageDetails[0] = message;
    chatToUpdate.lastMessage = message._id;
    // Update the state of chats, placing the updated chat at the beginning of the array
    setChats([
      chatToUpdate, // Place the updated chat first
      ...chats.filter((chat) => chat._id !== chatToUpdateId), // Include all other chats except the updated one
    ]);
  };


  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleCameraClick = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
    setIsOpen(!isOpen);
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
        const imageData = canvasRef.current.toDataURL('image/png');
        setSelectedMedia((prev) => [...prev, imageData]);
        // Stop the camera stream after capturing the image
        if (cameraStream) {
          cameraStream.getTracks().forEach(track => track.stop());
          setCameraStream(null);
        }
      }
    }
  };

  const handleCancelCapture = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  useEffect(() => {
    if (cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [cameraStream]);

const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  if (event.target.files) {
    const files = Array.from(event.target.files);
    const mediaUrls: string[] = [];
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const mediaUrl = e.target?.result as string;
        mediaUrls.push(mediaUrl);
        if (mediaUrls.length === files.length) {
          setSelectedMedia((prev) => [...prev, ...mediaUrls]);
        }
      };
      reader.readAsDataURL(file);
    });
  }
  setIsOpen(!isOpen);
};

const handleRemoveImage = (index: number) => {
  setSelectedMedia((prev) => prev.filter((_, i) => i !== index));
};

const getFileIconHtml = (fileName: string, size: string = 'fa-lg') => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const sizeClass = size === 'small' ? 'fa-sm' : 'fa-lg';
    const fileIconMap: { [key: string]: string } = {
        pdf: `<i class="fa fa-file-pdf text-red-500 ${sizeClass}"></i>`,
        doc: `<i class="fa fa-file-word text-blue-500 ${sizeClass}"></i>`,
        docx: `<i class="fa fa-file-word text-blue-500 ${sizeClass}"></i>`,
        mp3: `<i class="fa fa-file-audio text-green-500 ${sizeClass}"></i>`,
        mp4: `<i class="fa fa-file-video text-purple-500 ${sizeClass}"></i>`,
        ppt: `<i class="fa fa-file-powerpoint text-orange-500 ${sizeClass}"></i>`,
        pptx: `<i class="fa fa-file-powerpoint text-orange-500 ${sizeClass}"></i>`,
        xls: `<i class="fa fa-file-excel text-green-500 ${sizeClass}"></i>`,
        xlsx: `<i class="fa fa-file-excel text-green-500 ${sizeClass}"></i>`,
        png: `<i class="fa fa-file-image text-yellow-500 ${sizeClass}"></i>`,
        jpg: `<i class="fa fa-file-image text-yellow-500 ${sizeClass}"></i>`,
        jpeg: `<i class="fa fa-file-image text-yellow-500 ${sizeClass}"></i>`,
        default: `<i class="fa fa-file-alt text-gray-500 ${sizeClass}"></i>`,
    };
    return fileIconMap[extension || 'default'] || fileIconMap['default'];
};
const urlMapping: { [key: string]: string } = {};

const encodeUrlToRandomNumbers = (url: string): string => {
    const encodedUrl = url.split('').map(() => Math.floor(Math.random() * 10)).join('');
    urlMapping[encodedUrl] = url;
    return encodedUrl;
};

const decodeUrlFromRandomNumbers = (encodedUrl: string): string => {
    return urlMapping[encodedUrl] || encodedUrl;
};
  
  function convertUrlsToLinksANDImgs(text: string): string {
    const urlPattern = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
    const cloudinaryPattern = new RegExp(`https://res.cloudinary.com/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload/[-A-Z0-9+&@#\/%?=~_|!:,.;]*`, 'gi');
    const cloudinaryVideoPattern = new RegExp(`https://res.cloudinary.com/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/video/upload/[-A-Z0-9+&@#\/%?=~_|!:,.;]*\\.(mp4|mov|ogg)`, 'gi');
    const cloudinaryAudioPattern = new RegExp(`https://res.cloudinary.com/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/video/upload/[-A-Z0-9+&@#\/%?=~_|!:,.;]*\.webm`, 'gi');
    const s3Pattern = new RegExp(`https://${import.meta.env.VITE_AWS_BUCKET_NAME}.s3.${import.meta.env.VITE_AWS_REGION}}.amazonaws.com/[-A-Z0-9+&@#\/%?=~_|!:,.;]*`, 'gi');
    const emailPattern = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
    const mentionPattern = /(^|\s)(@[a-zA-Z0-9._-]+)/g;
    
    let replacedText = text
      .replace(urlPattern, (url) => {
      if (cloudinaryPattern.test(url)) {
        return `<img src="${url}" alt="Image" class="chat-image" />`;
        }
        if (cloudinaryAudioPattern.test(url)) {
                return `<audio controls src="${url}" style="background-color: #f0f0f0; border-radius: 8px; padding: 5px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);" class="chat-audio"></audio>`;
        }
        if (cloudinaryVideoPattern.test(url)) {
        return `<video controls src="${url}" class="chat-video" style="max-width: 310px; max-height: 350px; width:100%; height:auto; border:solid; border-radius:10px; border-width:0">Your browser does not support the video tag.</video>`;
      }
      if (s3Pattern.test(url)) {
        const fileName = decodeURIComponent(url.split('/').pop() || '');
        //console.log(fileName);
        if (fileName != null) {
          const cleanedFileName = fileName.replace(/^\d+_/, '');
          const fileNamePattern = new RegExp(`filename=([^&]+)`);
          const match = fileNamePattern.exec(url);
          const displayName = match ? decodeURIComponent(match[1]) : cleanedFileName;
          //const fileIcon = getFileIcon(fileName);
          const fileIconHtml = getFileIconHtml(fileName, 'large');
          return `
            <div class="file-message flex flex-col items-start border border-gray-300 p-2 rounded-md" style="max-width: 320px;">
                <div class="flex items-center mb-2">
                    ${fileIconHtml}
                    <span class="file-name rounded-md p-1 ml-2">${displayName}</span>
                </div>
                <div class="file-buttons flex space-x-2">
                    <button class="view-file-button flex items-center justify-center w-full border border-gray-300 p-2 rounded-md hover:bg-gray-200 hover:text-black active:bg-gray-300" onclick="window.handleViewFile('${url}', '${displayName}')">
                        <i class="fa fa-eye mr-2"></i> View File
                    </button>
                    <button class="download-file-button flex items-center justify-center w-full border border-gray-300 p-2 rounded-md hover:bg-gray-200 hover:text-black active:bg-gray-300" onClick="window.downloadFile('${url}', '${displayName}')">
                        <i class="fa fa-download mr-2"></i> Download
                    </button>
                </div>
            </div>
        `;
        }
        }
        if (!cloudinaryPattern.test(url) && !s3Pattern.test(url) && !emailPattern.test(url)) {
          const newUrl = encodeUrlToRandomNumbers(url);
          return `<a href="/" target="_blank" class="text-blue-500 underline" onClick="handleClickLink('${newUrl}')">${url}</a>`;
      }
        
      return "";
      })
    replacedText = replacedText.replace(emailPattern, '<a href="https://mail.google.com/mail/?view=cm&fs=1&to=$1" target="_blank" class="text-blue-500 underline">$1</a>')
        .replace(mentionPattern, (match, p1, p2) => {
      const username = p2.slice(1); // Remove the '@' symbol
      const ouserlink = `${import.meta.env.VITE_CLIENT_UR}/user/${username}`
      const nuserlink = encodeUrlToRandomNumbers(ouserlink);
      return `${p1}<a href="/" target="_blank" class="text-blue-500 underline cursor-pointer" onClick="handleClickLink('${nuserlink}')">${p2}</a>`;
    });
    // replacedText = replacedText.replace(urlPattern, `<a href="$1" target="_blank" class="text-blue-500 underline">$1</a>` );

    return replacedText;
  }
  
window.handleViewFile = async function(url: string, fileName: string) {
  const MicrosoftFileExtensions = ['.doc', '.docx','.ppt', '.xlsx','.pptx','xls'];
  const isMicrosoftFile = MicrosoftFileExtensions.some(ext => fileName.endsWith(ext));
  var new1 = "https://view.officeapps.live.com/op/view.aspx?src=";
    if (isMicrosoftFile) {
        window.open(`${new1}${url}`, '_blank');
    } else {
        window.open(url, '_blank');
    }
}

window.downloadFile = async function(url: string, fileName: string) {
    const response = await fetch(url);
    const blob = await response.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };
  
  window.handleClickLink = function (url: string) { 
    const link = decodeUrlFromRandomNumbers(url);
    window.open(link, '_blank');
  };

const renderMessageContent = (message: { content: string }) => {
  const isSharedMessage = message.content.includes('\n');
  if (isSharedMessage) {
    const formattedContent = message.content.replace(/\n/g, '<br/>');
    return <span dangerouslySetInnerHTML={{ __html: convertUrlsToLinksANDImgs(formattedContent) }} />;
  } else {
    return <span dangerouslySetInnerHTML={{ __html: convertUrlsToLinksANDImgs(message.content) }} />;
  }
};
  
const handleStartRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
    };

    mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecordedAudio(audioBlob);
        setAudioUrl(URL.createObjectURL(audioBlob));
        audioChunksRef.current = [];
    };

    mediaRecorder.start();
    setIsRecording(true);
};

const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
    }
};

const handleCancelRecording = () => {
    if (isRecording && mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
    }
    setRecordedAudio(null);
    setAudioUrl(null);
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
    }
};
    
const handlePlayPauseAudio = () => {
    if (audioUrl) {
        if (isPlaying) {
            audioRef.current?.pause();
        } else {
            if (!audioRef.current) {
                audioRef.current = new Audio(audioUrl);
                audioRef.current.onended = () => setIsPlaying(false);
            }
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    }
};

  const handleSendMessage = async () => {
    if (!message && selectedMedia.length === 0  && !selectedFile && !recordedAudio) return;
    if (!currentChat.current) return;

      if (selectedFile) {
        setIsImageUploading(true);
        
        // Configure AWS SDK
        AWS.config.update({
          accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
          secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
          region: import.meta.env.VITE_AWS_REGION, // Update to your region
        });

        const s3 = new S3();
        const params = {
          Bucket: import.meta.env.VITE_AWS_BUCKET_NAME,
          Key: `${Date.now()}_${selectedFile.name}`,
          Body: selectedFile,
          ContentType: selectedFile.type,
        };

        try {
          const uploadResult = await s3.upload(params).promise();
          const fileUrl = uploadResult.Location;

          const fileMessage = {
            chatId: currentChat.current?._id,
            content: `${fileUrl}?filename=${encodeURIComponent(selectedFile.name)}`,
            type: 'file',
          };

          sendMessage(fileMessage).then((res) => {
            socket?.emit(ChatEventEnums.MESSAGE_RECEIVED_EVENT, res.data.data);
            updateChatLastMessage(currentChat.current?._id!, res.data.data);
            if (currentChat.current?._id == res.data.data.chat) {
              setMessages([...messages, res.data.data]);
            }
            setSelectedFile(null);
            setIsImageUploading(false);
          });
        } catch (error) {
          console.error('Error uploading file:', error);
          setIsImageUploading(false);
        }
      }

      if (selectedMedia.length > 0) {
        setIsImageUploading(true);
        try {
          for (const media of selectedMedia) {
            const formData = new FormData();
            formData.append('file', media);
            formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET); // Replace with your Cloudinary upload preset

            const mimeType = media.split(';')[0].split(':')[1];
            let uploadUrl = '';

            if (mimeType.startsWith('image/')) {
              uploadUrl = `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`;
            } else if (mimeType.startsWith('video/')) {
              uploadUrl = `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/video/upload`;
            } else {
              throw new Error('Unsupported media format');
            }

            const response = await axios.post(uploadUrl, formData);

            const mediaUrl = response.data.secure_url;
            const mediaMessage = {
              chatId: currentChat.current?._id,
              content: mediaUrl,
              type: mimeType.startsWith('image/') ? 'image' : 'video',
            };

            sendMessage(mediaMessage).then((res) => {
              socket?.emit(ChatEventEnums.MESSAGE_RECEIVED_EVENT, res.data.data);
              updateChatLastMessage(currentChat.current?._id!, res.data.data);
              if (currentChat.current?._id == res.data.data.chat) {
                setMessages((prev) => [...prev, res.data.data]);
              }
            });
          }
          setSelectedMedia([]);
          setIsImageUploading(false);
        } catch (error) {
          console.error('Error uploading media:', error);
          setIsImageUploading(false);
        }
      }
      if (recordedAudio) {
        setIsImageUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', recordedAudio);
            formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET); // Replace with your Cloudinary upload preset

            const response = await axios.post(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/upload`, formData); // Replace with your Cloudinary URL
            const audioUrl = response.data.secure_url;

            const audioMessage = {
                chatId: currentChat.current?._id,
                content: audioUrl,
                type: 'audio',
            };

            sendMessage(audioMessage).then((res) => {
                socket?.emit(ChatEventEnums.MESSAGE_RECEIVED_EVENT, res.data.data);
                updateChatLastMessage(currentChat.current?._id!, res.data.data);
                if (currentChat.current?._id == res.data.data.chat) {
                    setMessages([...messages, res.data.data]);
                }
                setRecordedAudio(null);
                setIsImageUploading(false);
            });
        } catch (error) {
            console.error('Error uploading audio:', error);
            setIsImageUploading(false);
        }
      }
      else {
        const messageWithLinks = convertUrlsToLinksANDImgs(message);
        sendMessage({ chatId: currentChat.current?._id, content: messageWithLinks }).then((res) => {
          socket?.emit(ChatEventEnums.MESSAGE_RECEIVED_EVENT, res.data.data);
          updateChatLastMessage(currentChat.current?._id!, res.data.data);
          if (currentChat.current?._id == res.data.data.chat) {
            setMessages([...messages, res.data.data]);
          }
          setMessage('');
        });
      }
  };

  const handleReceiveMessage = (data: ChatMessageInterface) => {
    if (currentChat.current?._id == data.chat) {
      setMessages((prev) => [...prev, data]);
    } else {
      setUnreadMessages((prev) => [...prev, data]);
      setUnreadChats((prev) => new Set(prev).add(data.chat));
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    const message = messages.find((msg) => msg._id == messageId);
    deleteMessage({ messageId })
      .then((res) => {
        // socket?.emit(MESSAGE_DELETE_EVENT, res.data.data)
        if (currentChat.current?._id == res.data.data.chat) {
          setMessages((prev) => prev.filter((msg) => msg._id != messageId));
        }
        updateChatLastMessageOnDeletion(message?.chat!, message!);
      });
  };

  const handleDeleteMessageEvent = (message: ChatMessageInterface) => {
    setMessages((prev) => prev.filter((msg) => msg._id != message._id));

    setUnreadMessages((prev) => prev.filter((msg) => msg._id != message._id));
    updateChatLastMessageOnDeletion(message?.chat!, message!);
  };

  const handleLeaveChat = (chat: ChatInterface) => {
    if (currentChat.current?._id == chat._id) {
      currentChat.current = null;
      setMessages([]);
    }
    setChats((prev) => prev.filter((c) => c._id != chat._id));
  };

  const renderAsLinkOrEmailOrImgs = (text: string) => {
  
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/g;
    const s3Pattern = new RegExp(`https://${import.meta.env.VITE_AWS_BUCKET_NAME}.s3.${import.meta.env.VITE_AWS_REGION}.amazonaws.com/[-A-Z0-9+&@#\/%?=~_|!:,.;]*`, 'gi');

    const urls = text.match(urlRegex);
    const emails = text.match(emailRegex);

    const cloudinaryPattern = new RegExp(`https://res.cloudinary.com/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload/[-A-Z0-9+&@#\/%?=~_|!:,.;]*`, 'gi');
    const cloudinaryVideoPattern = new RegExp(`https://res.cloudinary.com/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/video/upload/[-A-Z0-9+&@#\/%?=~_|!:,.;]*\\.(mp4|mov|ogg)`, 'gi');
    const cloudinaryAudioPattern = new RegExp(`https://res.cloudinary.com/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/video/upload/[-A-Z0-9+&@#\/%?=~_|!:,.;]*\.webm`, 'gi');
    
    if (cloudinaryPattern.test(text)) {
      return (
        <span>
          <FaImage className="inline-block mr-1" /> Photo
        </span>
      );
    }
    if (cloudinaryVideoPattern.test(text)) {
      return (
        <span>
          <FaImage className="inline-block mr-1" /> Video
        </span>
      );
    }
    if (cloudinaryAudioPattern.test(text)) {
      return (
        <span>
          <FaMicrophone className="inline-block mr-1" /> Audio
        </span>
      );
    }

    if (s3Pattern.test(text)) { 
      const fileName = decodeURIComponent(text.split('/').pop() || '');
        //console.log(fileName);
          const cleanedFileName = fileName.replace(/^\d+_/, '');
          const fileNamePattern = new RegExp(`filename=([^&]+)`);
          const match = fileNamePattern.exec(text);
          const displayName = match ? decodeURIComponent(match[1]) : cleanedFileName;
          //const fileIcon = getFileIcon(fileName);
          const fileIconHtml = getFileIconHtml(fileName, 'small');
      return (
        <span>
          <span dangerouslySetInnerHTML={{ __html: fileIconHtml }} style={{ marginRight: '5px' }}/> {displayName}
        </span>
      );
    }

    if (emails && emails.length > 0) {
      return emails[0];
    } else if (urls && urls.length > 0) {
      return urls[0];
    } else {
      return text;
    }
  };

  const handleDownloadImage = async (url: string) => {
    try {
      // Remove any transformations from the Cloudinary URL to get the original image
      const originalUrl = url.replace(/\/upload\/[^/]+/, '/upload');
      const response = await fetch(originalUrl);
      const blob = await response.blob();
      const urlObject = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = urlObject;
      a.download = 'image.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(urlObject);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
    setIsOpen(!isOpen);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return <FaFilePdf className="text-red-500" />;
      case 'doc':
      case 'docx':
        return <FaFileWord className="text-blue-500" />;
      case 'mp3':
        return <FaFileAudio className="text-green-500" />;
      case 'mp4':
        return <FaFileVideo className="text-purple-500" />;
      case 'ppt':
      case 'pptx':
        return <FaFilePowerpoint className="text-orange-500" />;
      case 'xls':
      case 'xlsx':
        return <FaFileExcel className="text-green-500" />;
      default:
        return <FaFileAlt className="text-gray-500" />;
    }
  };

  const handleTyping = () => {
    if (!isTyping && socket) {
      setIsTyping(true);
      socket.emit(ChatEventEnums.TYPING_EVENT, { chatId: currentChat.current?._id, userId: user?._id });
    }
  };

  useEffect(() => {
    const typingTimeout = setTimeout(handleStopTyping, 3000); // Adjust the timeout as needed

    return () => {
      clearTimeout(typingTimeout);
    };
  }, [message]);

  // Emit stop typing event when the user stops typing
  const handleStopTyping = () => {
    if (isTyping && socket) {
      setIsTyping(false);
      socket.emit(ChatEventEnums.STOP_TYPING_EVENT, { chatId: currentChat.current?._id, userId: user?._id });
    }
  };

  useEffect(() => {
    setChatsLoading(true);
    getAllChats()
      .then((res) => {
        setChats(res.data.data);
        setChatsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on(ChatEventEnums.CONNECTED_EVENT, () => { console.log('connected'); });
      socket.on(ChatEventEnums.DISCONNECT_EVENT, () => { console.log('disconnected'); });
      socket.on(ChatEventEnums.NEW_CHAT_EVENT, (data) => {
        setChats([data, ...chats]);
      });
      socket.on(ChatEventEnums.MESSAGE_RECEIVED_EVENT, handleReceiveMessage);
      socket.on(ChatEventEnums.MESSAGE_DELETE_EVENT, handleDeleteMessageEvent);
      socket.on(ChatEventEnums.LEAVE_CHAT_EVENT, handleLeaveChat);
    }
    return () => {
      socket?.off(ChatEventEnums.CONNECTED_EVENT, () => { console.log('connected'); });
      socket?.off(ChatEventEnums.DISCONNECT_EVENT, () => { console.log('disconnected'); });
      socket?.off(ChatEventEnums.NEW_CHAT_EVENT, (data) => {
        setChats([data, ...chats]);
      });
      socket?.off(ChatEventEnums.MESSAGE_RECEIVED_EVENT, handleReceiveMessage);
      socket?.off(ChatEventEnums.MESSAGE_DELETE_EVENT, handleDeleteMessageEvent);
      socket?.off(ChatEventEnums.LEAVE_CHAT_EVENT, handleLeaveChat);
    };
  }, [socket, chats]);

  useEffect(() => {
    if (currentChat.current) {
      socket?.emit(ChatEventEnums.MESSAGE_READ_EVENT, {
        chatId: currentChat.current._id,
        userId: user?._id,
      });
    }
  }, [currentChat.current, socket, user?._id]);
  
  useEffect(() => {
  if (socket) {
    socket.on(ChatEventEnums.MESSAGE_READ_EVENT, ({ chatId, userId }) => {
      if (userId !== user?._id) {
        setReadMessages((prev) => new Set(prev).add(chatId));
      }
    });
  }
  return () => {
    socket?.off(ChatEventEnums.MESSAGE_READ_EVENT);
  };
  }, [socket, user?._id]);
  
  useEffect(() => {
    if (socket && currentChat.current) {
      const receiverId = currentChat.current.isGroupChat ? null : getChatObjectMetadata(currentChat.current, user!)?._id;

      if (receiverId) {
        socket.emit('checkUserStatus', receiverId);

        socket.on('userOnline', (userId: string) => {
          if (userId === receiverId) {
            setIsReceiverOnline(true);
          }
        });

        socket.on('userOffline', (userId: string) => {
          if (userId === receiverId) {
            setIsReceiverOnline(false);
          }
        });
      }
    }

    return () => {
      socket?.off('userOnline');
      socket?.off('userOffline');
    };
  }, [socket, currentChat.current, user]);

  useEffect(() => {
    const typingTimeout = setTimeout(handleStopTyping, 3000); // Adjust the timeout as needed

    return () => {
      clearTimeout(typingTimeout);
    };
  }, [message]);

  useEffect(() => {
    if (socket) {
      socket.on(ChatEventEnums.TYPING_EVENT, ({ userId }) => {
        if (userId !== user?._id) {
          setTypingUser(userId);
        }
      });

      socket.on(ChatEventEnums.STOP_TYPING_EVENT, ({ userId }) => {
        if (userId !== user?._id) {
          setTypingUser(null);
        }
      });

      return () => {
        socket.off(ChatEventEnums.TYPING_EVENT);
        socket.off(ChatEventEnums.STOP_TYPING_EVENT);
      };
    }
  }, [socket, user?._id]);

useEffect(() => {
  const sendMessageFromUrl = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const text = urlParams.get('text');
    const title = urlParams.get('title');
    const description = urlParams.get('description');
    const url = urlParams.get('url');
    const groupName = urlParams.get('groupName'); // Use groupName instead of groupId

    if (username && text && title && description && url) {
      try {
        if (groupName) {
          // Send message to group
          await sendMessageToGroup({ groupName, text, title, description, url });
          navigate(`/chat/${groupName}`);
        } else {
          // Send message to follower
          await sendMessageToFollower({ username, text, title, description, url });
          navigate(`/chat/${username}`);
        }
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  sendMessageFromUrl();
}, [username, navigate]);
  
  
  
  return (
    <div className="w-full md:w-3/4 h-screen flex">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"></link>
      <div className={`md:w-[30%] md:block h-screen border-0 border-r ${currentChat.current ? 'hidden' : 'w-full block'}`}>
        <MobileUserNavbar scrollableDiv={scrollableDiv} />
        <div className='flex justify-between mx-5 mt-2 items-end'>
          <div className="text-3xl font-bold font-sans">Chats</div>
          <AddChatModal chats={chats} setChats={setChats} />
        </div>
        <div className='w-[90%] mx-auto mt-3'>
          <Input value={chatsSearch} onChange={(e) => setChatsSearch(e.target.value)} placeholder='Search...' />
        </div>
        <Separator className='mt-3' />
        <div ref={scrollableDiv} className='w-full h-[80vh] overflow-y-auto'>
          {chatsLoading && <Loader />}
          {chats
            .filter((chat) => getChatObjectMetadata(chat, user!)?.title?.toLowerCase().includes(chatsSearch.toLowerCase()))
            .filter((chat) => getChatObjectMetadata(chat, user!)?.lastMessageDetails?.createdAt) // Filter out chats without a valid createdAt date
            .sort((a, b) => {
              const aLastMessage = getChatObjectMetadata(a, user!)?.lastMessageDetails?.createdAt;
              const bLastMessage = getChatObjectMetadata(b, user!)?.lastMessageDetails?.createdAt;
              return new Date(bLastMessage!).getTime() - new Date(aLastMessage!).getTime();
            })
            .map((chat: ChatInterface) => {
              const chatDetails = getChatObjectMetadata(chat, user!);
              const lastMessageDetails = chatDetails?.lastMessageDetails;
              return (
                <div
                  key={chat._id}
                  onClick={() => handleOnChatClick(chat)}
                  className={`border-b max-w-full cursor-pointer hover:bg-muted p-3 ${
                    currentChat.current?._id == chat._id
                      ? 'bg-muted'
                      : unreadMessages.filter((m) => m.chat == chat._id).length > 0
                      ? 'bg-green-800'
                      : 'bg-transparent'
                  }`}
                >
                  <div className="flex justify-between items-center w-full px-3">
                    <div className="flex gap-2 items-center justify-start max-w-full">
                      <div className="min-w-fit">
                        <img
                          src={chatDetails?.profilePicture}
                          className="w-10 h-10 rounded-full"
                          alt="User profile Picture"
                        />
                      </div>
                      <div className="max-w-[70%]">
                        <div className="font-bold">{chatDetails?.title}</div>
                        <div className="text-sm text-muted-foreground line-clamp-1 max-w-[]">
                          {chatDetails?.lastMessage && renderAsLinkOrEmailOrImgs(chatDetails.lastMessage)}
                        </div>
                        {lastMessageDetails?.createdAt && (
                          <div className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(lastMessageDetails.createdAt), { addSuffix: true })}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <EllipsisVertical className='min-w-fit' />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleViewProfile(chatDetails)}>View Profile</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={(e) => handleDeleteChat(e, chat)}>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              )
            })}
        </div>
      </div>
      <div className={`${currentChat.current && currentChat.current._id ? 'block w-[100%]' : 'hidden w-0'}  md:w-[70%] flex overflow-y-auto flex-col-reverse`}>
        <div className='fixed top-0 z-50 w-full'>
          {currentChat.current && <div className='flex gap-3 items-center w-full p-3 bg-muted'>
            <div className=''>
              <Button onClick={
                () => {
                  currentChat.current = null;
                  setMessages([]);
                }
              } variant={"ghost"} className=''>
                <ArrowLeft />
              </Button>
            </div>
            <div className='min-w-fit'>
              <img src={getChatObjectMetadata(currentChat.current, user!)?.profilePicture} className='w-10 h-10  rounded-full' alt="User profile Picture" />
            </div>
            <div className='max-w-[70%]'>
              <Link to={currentChat?.current?.isGroupChat ? `/groups/${currentChat.current.group}` : `/user/${getChatObjectMetadata(currentChat.current, user!)?.title}`} className='font-bold hover:underline'>
                {getChatObjectMetadata(currentChat.current, user!)?.title}
              </Link>
            </div>
            {!currentChat.current?.isGroupChat && (
              <div className='text-sm text-muted-foreground'>
                {/* {isReceiverOnline ? 'Online' : 'Offline'} */}
              </div>
            )}

<Dialog>
  <DialogTrigger asChild>
    <Button
      onClick={() => {
        extractDocumentLinks();
        extractImageLinks();
        extractVideoLinks();
        extractAudioLinks();
      }}
      variant={"ghost"}
      style={{ position: 'fixed', right: '80px' }}
    >
      <FaFolderOpen style={{ width: '25px', height: '25px' }} />
    </Button>
  </DialogTrigger>
  <DialogContent tabs={tabs}>
    {/* This content will be shown if no tabs are provided */}
    <DocumentList links={documentLinks} />
  </DialogContent>
</Dialog>
            {isDocumentBoxOpen && <DocumentList links={documentLinks} />}
            <Button onClick={handleSearchClick} variant={"ghost"} style={{position: 'fixed', right: '20px', }}>
                <FaSearch style={{ width: '20px', height: '20px' }}/>
            </Button>
            {isSearchVisible && (
                    <div style={{position: 'fixed', top: '70px', right: '20px', display: 'flex', alignItems: 'center', backgroundColor: 'rgba(6,10,19,255)', border: '0', borderRadius:'5px', padding: '10px', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)', animation: 'slide-in 0.3s ease-out'}}>
                      <input
                        type="text"
                        value={searchText}
                        onChange={handleSearchChange}
                        onKeyPress={handleSearchKeyPress}
                        onKeyDown={(e) => {
                          if (e.key === 'ArrowUp') {
                            handleSearchUp();
                          } else if (e.key === 'ArrowDown') {
                            handleSearchDown();
                          }
                        }}
                        placeholder="Find text"
                        style={{ marginRight: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px', backgroundColor:'rgba(30,41,59,255)'}}
                      />
                      <button onClick={handleSearchUp} style={{ background: 'none', border: 'none', cursor: 'pointer'}}>
                        <FaArrowUp/>
                      </button>
                      <button onClick={handleSearchDown} style={{ background: 'none', border: 'none', cursor: 'pointer'}} className='ml-2'>
                        <FaArrowDown/>
                      </button>
                    </div>
                  )}
          </div>}
        </div>
        {
          currentChat.current && <div className='w-full mt-16'>
                  {messagesLoading && (
        <div className='flex justify-center items-center'>
          <div className='animate-spin rounded-full my-auto h-32 w-32 border-b-2 border-gray-800'></div>
        </div>
      )}
      {messages.map((message: ChatMessageInterface, index: number) => {
        const isImageMessage = message.content.includes(`https://res.cloudinary.com/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload/`);
        const isRead = readMessages.has(message._id);
        const isHighlighted = message._id === highlightedMessageId;
        return (
          <ContextMenu key={message._id} modal={isContextOpen} onOpenChange={() => {
            setIsContextOpen(!isContextOpen);
            setSelectedMessage(message._id);
          }}>
            <ContextMenuTrigger>
              <div id={`message-${index}`} className={`w-fit items-center gap-2 p-2 m-1 mx-2 rounded-xl max-w-[55%] ${message.sender?._id == user?._id ? `ml-auto flex flex-row-reverse duration-250 ${(selectedMessage == message._id && isContextOpen) ? 'bg-green-950' : 'bg-green-800'} ${isHighlighted ? 'bg-green-950' : ''}` : `flex ${(selectedMessage == message._id && isContextOpen) ? 'bg-indigo-950' : 'bg-blue-900'} ${isHighlighted ? 'bg-green-950' : ''}`}`}>
                <div className='min-w-fit' style={{ width: '30px', position: 'relative' }}>
                  <img src={message.sender?.profilePicture} className='w-7 h-7 min-w-fit rounded-full' alt="User profile Picture" />
                </div>
                <div className='max-w-[90%]'>
                  <Link to={`/user/${message.sender?.username}`} className='text-xs hover:underline text-muted dark:text-muted-foreground'>{message.sender?.username == user?.username ? 'You' : message.sender?.username}</Link>
                  <div className='w-full break-words text-white'>
                    {message.replyTo && (
                      <div className="reply-preview p-1 mb-1 border-l-4 border-blue-500 bg-gray-800 text-xs text-gray-300 rounded">
                        Reply to <strong>{message.replyTo.sender.username}</strong>: {message.replyTo.contentSnippet}
                      </div>
                    )}
                    {isImageMessage ? (
                      <Dialog>
                        <DialogTrigger>
                          <div className="relative">
                            <img
                              src={message.content}
                              alt="Image"
                              className="chat-image rounded-lg cursor-pointer"
                              style={{ width: '100%', height: 'auto', maxWidth: '320px', maxHeight: '350px' }}
                            />
                            {isImageUploading && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                                <FaSpinner className="animate-spin text-white text-3xl" />
                              </div>
                            )}
                          </div>
                        </DialogTrigger>
                        <DialogContent className="bg-transparent border-0">
                          <img src={message.content} alt="Image" className="w-full h-full" />
                        </DialogContent>
                      </Dialog>
                    ) : renderMessageContent(message)}
                  </div>
                  {typingUser && <div style={{ color: 'gray', margin: '10px' }}>typing...</div>}
                  <div className='flex justify-between items-end'>
                    <div className='text-xs text-accent-foreground dark:text-muted-foreground'>
                      {new Date(message.createdAt).toLocaleString(
                        'en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: '2-digit',
                        hour: 'numeric',
                        minute: 'numeric',
                        hour12: true,
                      })}
                    </div>
                    {message.sender?._id == user?._id && (
                      <FaCheckDouble className={`ml-2 ${isRead ? 'text-blue-500' : 'text-gray-500'}`} />
                    )}
                  </div>
                </div>
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent className='md:w-64'>
              <ContextMenuItem onClick={() => setReplyMessage(message)}>Reply</ContextMenuItem>
              <ContextMenuItem onClick={() => handleCopyMessage(message.content)}>Copy</ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem className={`${(message.sender?._id === user?._id || message.sender?._id === "67b88e66815a779177736fe2") ? 'text-red-500' : 'hidden'}`}  onClick={() => handleDeleteMessage(message._id)}> Delete Message</ContextMenuItem>
              {isImageMessage && (
                <>
                  <ContextMenuSeparator />
                  <ContextMenuItem className='text-green-500' onClick={() => handleDownloadImage(message.content)}>Download Image</ContextMenuItem>
                </>
              )}
            </ContextMenuContent>
          </ContextMenu>
        );
      })}
            <div className='lg:hidden text-center text-muted text-xs'>Press and hold to select a message</div>
            <div className='sticky bottom-0 md:bottom-2 my-2 mx-2 bg-background flex flex-col border p-2 rounded-md'>
              {cameraStream && (
                <div className="relative rounded-xl my-4 mt-0" style={{ width: '600px', height: '100%', borderRadius: '10px' }}>
                  <button onClick={handleCancelCapture} className="absolute top-2 right-2 p-2 bg-gray-800 text-white rounded-full cursor-pointer z-10">
                    <FaTimes />
                  </button>
                  <video ref={videoRef} autoPlay style={{ display: 'block', width: '100%', height: '100%', borderRadius: '10px' }} className='rounded-xl' />
                  <div className="w-[90vh] absolute bottom-0 left-1/2 transform -translate-x-1/2 p-2 bg-black bg-opacity-90 rounded-lg z-10 flex items-center justify-center">
                    <button onClick={handleCapture} className="w-12 h-12 shadow-lg bg-blue-500 text-white rounded-full flex items-center justify-center">
                      <FaCamera style={{ width: '25px', height: '25px' }} />
                    </button>
                  </div>
                </div>
              )}
              <canvas ref={canvasRef} style={{ display: 'none', width: '50%', height: '50%'}} />
              
              {selectedMedia.length > 0 && (
                <div className='relative media-preview mb-2 flex flex-wrap'>
                  {selectedMedia.map((media, index) => (
                    <div key={index} className='relative mr-2 mb-2'>
                      {media.startsWith('data:image') ? (
                        <img src={media} alt={`Selected ${index}`} className="rounded-lg" style={{ maxWidth: '100px', maxHeight: '100px' }} />
                      ) : (
                        <video controls className="rounded-lg" style={{ maxWidth: '100px', maxHeight: '100px' }} src={media}>
                          Your browser does not support the video tag.
                        </video>
                      )}
                      <button onClick={() => handleRemoveImage(index)} className='absolute top-0 right-0 p-1 bg-grey text-white rounded-full'>
                        <FaTimes />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {selectedFile && (
                <div className='relative file-preview mb-2 flex items-center'>
                  {getFileIcon(selectedFile.name)}
                  <span className='ml-2'>{selectedFile.name}</span>
                  <button onClick={handleRemoveFile} className='absolute top-0 right-0 p-1 bg-grey text-white rounded-full'>
                    <FaTimes />
                  </button>
                </div>
              )}
        {isRecording && (
            <div className='relative audio-preview mb-2'>
                <div className='p-1 bg-grey text-white rounded-full flex items-center'>
                    {<FaRecordVinyl />}
                  <span className='ml-2'>{ 'Recording...' }</span>
                  </div>
                  <button onClick={handleCancelRecording} className='absolute top-0 right-0 p-1 bg-grey text-white rounded-full'>
                    <FaTimes />
                </button>
            </div>
        )}
        {recordedAudio && (
            <div className='relative audio-preview mb-2'>
                <button onClick={handlePlayPauseAudio} className='p-1 bg-grey text-white rounded-full flex items-center'>
                    {isPlaying ? <FaPause /> : <FaPlay />}
                    <span className='ml-2'>{isPlaying ? 'Pause' : 'Play'}</span>
                </button>
                <button onClick={handleCancelRecording} className='absolute top-0 right-0 p-1 bg-grey text-white rounded-full'>
                    <FaTimes />
                </button>
            </div>
        )}
            {replyMessage && (
                <div className="reply-preview p-2 border-l-4 border-blue-500 mb-2 flex items-center justify-between bg-gray-200 dark:bg-gray-700">
                  <div>
                    <strong>Replying to:</strong> {replyMessage.sender?.username} - {replyMessage.content.slice(0, 50)}...
                  </div>
                  <button onClick={() => setReplyMessage(null)} className="text-red-500 ml-2">
                    Cancel
                  </button>
                </div>
              )}
              <div className='flex items-center w-full'>
                <div className='flex-grow'>
                  <Input maxLength={MESSAGE_LENGTH_LIMIT} onKeyDown={(e) => { if (e.key == 'Enter') handleSendMessage() }} value={message} className={`${message.length == MESSAGE_LENGTH_LIMIT ? 'border-red-500' : ''}`} onChange={(e) => setMessage(e.target.value)} placeholder='Type a message...' />
                </div>                  
                <div className='flex items-center'>
                  <div className='min-w-fit text-xs text-muted-foreground ml-2'>
                    <span className={` ${message.length >= MESSAGE_LENGTH_LIMIT - 10 ? 'text-red-500' : 'text-green-500'}`}>{message.length}</span>/{MESSAGE_LENGTH_LIMIT}
                  </div>
                  <Button variant="ghost" onClick={isRecording ? handleStopRecording : handleStartRecording}>
                      {isRecording ? <FaStop style={{ width: '25px', height: '25px' }} /> : <FaMicrophone style={{ width: '25px', height: '25px' }} />}
                  </Button>
                  <div className="relative">
                    <Button onClick={toggleOptions} variant="ghost" className="relative">
                      <FaPaperclip style={{ width: '20px', height: '20px' }} />
                    </Button>
                    {isOpen && (
                      <div className="absolute bottom-full right-0 flex flex-col space-y-2 mb-2">
                        <div>
                            <button className="w-12 h-12 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-blue-400 flex items-center justify-center" title="Upload Media">
                              <input type="file" id="imageUpload" multiple style={{ display: 'none' }} accept="image/*,video/*" onChange={handleImageChange} />
                              <Button onClick={() => document.getElementById('imageUpload')?.click()} variant="ghost" style={{backgroundColor:"rgba(0, 0, 0, 0) "}}>
                                <FaImages style={{ width: '25px', height: '25px' }} />
                              </Button>
                            </button>
                        </div>
                        <div>
                            <button
                              className="w-12 h-12 bg-yellow-500 text-white rounded-full shadow-lg hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-green-400 flex items-center justify-center" title="Capture Media" onClick={handleCameraClick}>
                              <FaCamera style={{ width: '25px', height: '25px' }}/>
                            </button>
                        </div>
                        <div>
                          <button className="w-12 h-12 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-green-400 flex items-center justify-center" title="Upload Document">
                          <input type="file" id="fileUpload" style={{ display: 'none' }} onChange={handleFileChange} />
                            <Button onClick={() => document.getElementById('fileUpload')?.click()} variant="ghost" style={{backgroundColor:"rgba(0, 0, 0, 0) "}}>
                              <FaFile style={{ width: '20px', height: '20px' }} />
                            </Button>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <Button className="cursor-pointer" disabled={message.length == 0 && !selectedMedia && !selectedFile && !recordedAudio} onClick={handleSendMessage}>
                    <FaPaperPlane />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  )
}
  
export default Chat
