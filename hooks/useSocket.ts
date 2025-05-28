import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { BACKEND_URL } from "../constants/config";
import { getUserIdLocalStore } from "./useToken";

// Remove '/api/v1' from WebSocket URL
const SOCKET_URL = BACKEND_URL.replace('/api/v1', '');

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const initSocket = async () => {
      const id = await getUserIdLocalStore();
      if (!id) {
        // If no user ID, disconnect existing socket if any
        if (socketRef.current) {
          socketRef.current.disconnect();
          socketRef.current = null;
          setSocket(null);
        }
        return;
      }
      
      // Only create new socket if we don't have one
      if (!socketRef.current) {
        const newSocket = io(SOCKET_URL, {
          transports: ["websocket"],
          path: "/socket.io/",
        });

        newSocket.on("connect", () => {
          newSocket.emit("join-room", { userId: id });
        });

        newSocket.on("connect_error", (error) => {
          console.error("Socket connection error:", error);
        });

        socketRef.current = newSocket;
        setSocket(newSocket);
      }

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
          socketRef.current = null;
          setSocket(null);
        }
      };
    };

    initSocket();
  }, []);

  return socket;
};
