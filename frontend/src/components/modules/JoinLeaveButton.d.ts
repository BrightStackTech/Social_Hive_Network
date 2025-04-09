declare const JoinLeaveButton: ({ className, communityName, isJoined, onJoinLeave, isRemoved, isPending }: {
    className?: string;
    communityName: string;
    isJoined: boolean;
    onJoinLeave: (communityName: string) => void;
    isRemoved: boolean;
    isPending: boolean;
}) => import("react/jsx-runtime").JSX.Element;
export default JoinLeaveButton;
