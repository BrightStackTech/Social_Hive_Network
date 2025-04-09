export interface ComReply {
    _id: string;
    replyBody?: string;
    createdAt?: string;
    repliedBy?: {
        _id: string;
        username?: string;
    };
    upvotedBy?: string[];
    downvotedBy?: string[];
    pointsCount?: number;
    comment?: {
        community?: {
            communityName?: string;
        };
    };
    isEdited?: boolean;
}
declare const ComReplyCard: ({ reply }: {
    reply: ComReply;
}) => import("react/jsx-runtime").JSX.Element;
export default ComReplyCard;
