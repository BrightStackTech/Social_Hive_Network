import { UserInterface } from "@/context/AuthContext";
import { PostInterface } from "@/types";
export interface PostCardProps {
    postedUser: UserInterface;
    post: PostInterface;
    refreshFunc: () => void;
}
declare const PostCard: ({ postedUser, post, refreshFunc }: PostCardProps) => import("react/jsx-runtime").JSX.Element;
export default PostCard;
