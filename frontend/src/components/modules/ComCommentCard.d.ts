export interface ComComment {
    _id: string;
    commentBody?: string;
    createdAt?: string;
    commentedBy?: {
        _id: string;
        username?: string;
    };
    upvotedBy?: string[];
    downvotedBy?: string[];
    pointsCount?: number;
    replies?: string[];
    community?: {
        communityName?: string;
        admin?: string;
        removedMem?: {
            _id: string;
        }[];
        pendingReq?: {
            _id: string;
        }[];
    };
    isEdited?: boolean;
}
declare const ComCommentCard: ({ comment }: {
    comment: ComComment;
}) => import("react/jsx-runtime").JSX.Element;
export default ComCommentCard;
