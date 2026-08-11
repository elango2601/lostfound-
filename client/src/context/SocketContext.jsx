import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';
import toast from 'react-hot-toast';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      const backendUrl = `http://${window.location.hostname}:5001`;
      
      const newSocket = io(backendUrl, {
        reconnection: true,
        withCredentials: true
      });
      
      setSocket(newSocket);

      // Listen for global real-time notifications
      newSocket.on('new_notification', (data) => {
        toast.success(data.message || 'New update received!', {
          icon: '🔔',
          style: {
            borderRadius: '12px',
            background: '#fff',
            color: '#374151',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          },
        });
      });

      return () => newSocket.close();
    }
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
