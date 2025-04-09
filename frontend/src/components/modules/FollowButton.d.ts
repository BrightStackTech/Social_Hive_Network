declare const FollowButton: ({ className, userIdToFollow, callback }: {
    className?: string;
    userIdToFollow: string | undefined;
    callback?: () => void;
}) => import("react/jsx-runtime").JSX.Element;
export default FollowButton;
