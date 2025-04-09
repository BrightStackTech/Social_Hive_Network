declare global {
    interface Window {
        downloadFile: (url: string, fileName: string) => void;
        handleViewFile: (url: string, fileName: string) => void;
        handleClickLink: (url: string) => void;
    }
}
declare function Chat(): import("react/jsx-runtime").JSX.Element;
export default Chat;
