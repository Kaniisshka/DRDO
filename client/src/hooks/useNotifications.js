import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify'; // Assume installed

const socket = io('http://localhost:3000');

export const useNotifications = () => {
    useEffect(() => {
        socket.on('notification', (data) => {
            toast.info(data.message);
        });

        return () => {
            socket.off('notification');
        };
    }, []);
};