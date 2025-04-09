import { UserInterface } from '@/context/AuthContext';
declare const PostCard: ({ otherUser, post, followCallback }: {
    otherUser: UserInterface | undefined;
    post: any;
    followCallback?: () => void;
}) => import("react/jsx-runtime").JSX.Element;
export default PostCard;
