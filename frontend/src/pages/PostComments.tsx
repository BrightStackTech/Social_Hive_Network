import { useEffect, useState, useRef } from "react";
import { getCommentsbyPost, getPost, addComment ,deleteComment} from '@/api/index';
import { Link, useParams } from "react-router-dom";
import { PostInterface, CommentInterface } from "@/types";
import PostCard from "@/components/modules/Posts/OthersPostCard";
import ProfileSideBar from "@/components/sections/ProfileSideBar";
import PostSkeletonLoader from "@/components/modules/Posts/PostSkeletonLoader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { formatDistanceToNow } from 'date-fns';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
import { EllipsisVertical } from "lucide-react";
import MobileUserNavbar from "@/components/sections/MobileUserNavbar";
function PostComments() {
    const [post, setPost] = useState<PostInterface | null>(null);
    const [comments, setComments] = useState<CommentInterface[]>([]);
    const [loading, setLoading] = useState(false);
    const [commentLoading, setCommentLoading] = useState(false);
    const [comment, setComment] = useState('');
    const [error, setError] = useState('');
    const scrollableDivRef = useRef(null)
    
    const { postId } = useParams();
    const { user } = useAuth();

    const handleAddComment = async () => {
        if (!comment.trim()) return;
        setCommentLoading(true);
        setError('');
        try {
            const response = await addComment({content: comment, postId});
            if (response.status === 201) {
                setComments(prevComments => [response.data.data, ...prevComments]);
                setComment('');
                //TODO: increment post.comments in PostCard
                
                
            }
        } catch (err) {
            setError('Failed to post comment. Please try again.');
        } finally {
            setCommentLoading(false);
        }
    };

    const handleDeleteComment = (commentId: string) => {
        setCommentLoading(true);
        setError('');
        deleteComment({commentId})
            .then(response => {
                if (response.status === 200) {
                    setComments(prevComments => prevComments.filter(comment => comment._id !== commentId));
                }
            })
            .catch(() => {
                setError('Failed to delete comment. Please try again.');
            })
            .finally(() => {
                setCommentLoading(false);
            });
    };

function convertUrlsToLinks(text: string): string {
    // Regular expression to find URLs
    const urlPattern = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
    // Regular expression to find email addresses
    const emailPattern = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;

    // Replace URLs with anchor tags
    let replacedText = text.replace(urlPattern, '<a href="$1" target="_blank" class="text-blue-500 underline">$1</a>');
    // Replace email addresses with Gmail compose links
    replacedText = replacedText.replace(emailPattern, '<a href="https://mail.google.com/mail/?view=cm&fs=1&to=$1" target="_blank"  class="text-blue-500 underline">$1</a>');

    return replacedText;
}

    useEffect(() => {
        setLoading(true);
        Promise.all([
            getPost({postId}),
            getCommentsbyPost({postId})
        ]).then(([postData, commentsData]) => {
            setPost(postData.data.data);
            setComments(commentsData.data.data);
        }).catch(err => {
            console.error("Error fetching data:", err);
        }).finally(() => {
            setLoading(false);
        });
    }, [postId]);

    return (
        <div className='flex'>
            <div className="hidden md:block md:w-1/4 border-0 border-r-[1px] h-screen">
                <ProfileSideBar />
            </div>
            <div className="md:w-[50%] w-full overflow-y-auto scrollbar-hide border-0 border-r-[1px] h-screen pb-20">
                <MobileUserNavbar scrollableDiv={scrollableDivRef} />
                <div ref={scrollableDivRef} className="md:p-4">
                    {loading && <PostSkeletonLoader />}
                    {!loading && post && <PostCard post={post} otherUser={post.createdBy} />}
                    
                    <h2 className="text-xl font-bold mt-6 mb-4 px-4">Comments</h2>
                    
                    {loading && <PostSkeletonLoader />}
                    {commentLoading && <PostSkeletonLoader />}
                    {!loading && comments.length === 0 && (
                        <p className="text-center text-gray-500 mt-4">No comments yet.</p>
                    )}
                    {!loading && !commentLoading && comments.map((comment) => (
                        <div key={comment._id} className="mb-6 px-4">
                            <div className="flex items-start gap-3">
                                <img src={comment?.user?.profilePicture} className="w-8 h-8 rounded-full" alt={comment.user?.username} />
                                <div className="flex-1">
                                    <Link to={
                                        `/user/${comment.user?.username}`}
                                     className="font-bold text-sm">{comment.user?.username}</Link>
                                    <div className="mt-1 text-sm" dangerouslySetInnerHTML={{ __html: convertUrlsToLinks(comment.comment) }} />
                                    <p className="text-xs text-gray-500 mt-1">
                                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                    </p>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                    <Button className={`w-fit  ${
                                        comment?.user?._id === user?._id ? '' : 'hidden'}
                                    `} variant="ghost">
                                        <EllipsisVertical size={20}/>
                                        <span className="sr-only">Toggle user menu</span>
                                    </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <Button className={`w-full`} variant={"destructive"}
                                        onClick={() => handleDeleteComment(comment._id) }               
                                        >
                                            Delete Comment
                                        </Button>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="fixed bottom-0 w-full md:w-auto md:left-1/4 md:right-1/4 bg-muted px-4 py-3 border-t">
                    <div className="flex items-center gap-2">
                        <img src={user?.profilePicture} className="w-8 h-8 rounded-full" alt={user?.username} />
                        <div className="w-full">

                        <Input 
                            value={comment} 
                            onChange={(e) => setComment(e.target.value)} 
                            className="flex-1 w-full " 
                            placeholder="Add a comment..." 
                            />
                        </div>
                        <Button onClick={handleAddComment} disabled={commentLoading
                            || !comment.trim()
                        }>
                            {commentLoading ? 'Posting...' : 'Post'}
                        </Button>
                    </div>
                    {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
                </div>
            </div>
            <div className="w-1/4 hidden md:block">
                {/* Right sidebar content */}
            </div>
        </div>
    );
}

export default PostComments;
