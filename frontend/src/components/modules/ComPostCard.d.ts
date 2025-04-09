export interface ComPost {
    _id: string;
    title?: string;
    description?: string;
    pointsCount?: number;
    upvotedBy?: string[];
    downvotedBy?: string[];
    comments?: {
        _id: string;
    }[];
    commentCount?: number;
    createdAt?: string;
    media?: string[];
    community?: {
        communityName?: string;
        admin?: string;
    };
    author?: {
        username?: string;
        _id?: string;
    };
    isEdited?: boolean;
}
declare const ComPostCard: ({ post }: {
    post: ComPost;
}) => import("react/jsx-runtime").JSX.Element;
export default ComPostCard;
