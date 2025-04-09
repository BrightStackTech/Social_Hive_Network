import socketio from "socket.io-client";
declare const useSocket: () => {
    socket: ReturnType<typeof socketio> | null;
};
declare const SocketProvider: ({ children }: {
    children: React.ReactNode;
}) => import("react/jsx-runtime").JSX.Element;
export { useSocket, SocketProvider };
