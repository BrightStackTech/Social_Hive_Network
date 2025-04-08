import { createContext, useContext, useEffect, useState } from "react";
import socketio from "socket.io-client";
const SocketContext = createContext<{
    socket:ReturnType<typeof socketio>|null
}>(
    {
        socket:null
    }
);

const useSocket = () => useContext(SocketContext);

const getSocket = ()=>{
    const token = localStorage.getItem('token')
    return socketio(
        import.meta.env.VITE_APP_SOCKET_URI,
        {
            withCredentials:true,
            auth:{token},
        
        }
    )
}
const SocketProvider = ({children}:{children:React.ReactNode}) => {
    const [socket, setSocket] = useState<ReturnType<typeof socketio> | null>(null);
    useEffect(() => {
        
        setSocket(getSocket());
        
    }, []);
    return (
        <SocketContext.Provider value={{socket}}>
            {children}
        </SocketContext.Provider>
    );
};
export  {useSocket, SocketProvider}