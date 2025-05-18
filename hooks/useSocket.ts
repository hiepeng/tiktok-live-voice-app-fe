import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { BACKEND_URL } from "../constants/config";
import { getUserIdLocalStore } from "./useToken";

// Remove '/api/v1' from WebSocket URL
const SOCKET_URL = BACKEND_URL.replace('/api/v1', '');

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const initSocket = async () => {
      const id = await getUserIdLocalStore();
      if (!id) return;
      
      setUserId(id);
      
      const newSocket = io(SOCKET_URL, {
        transports: ["websocket"],
        path: "/socket.io/", // explicitly set the socket.io path
      });

      newSocket.on("connect", () => {
        // console.log("Socket connected with ID:", newSocket.id);
        newSocket.emit("join-room", { userId: id });
      });

      newSocket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
      });

      socketRef.current = newSocket;
      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    };

    initSocket();
  }, []);

  return socket;
};
