import { useCallback, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:4000';
const SOCKET_OPTIONS = {};

export const useSocketConnection = () => {
	const [socket, setSocket] = useState<Socket | null>(null);
	const [isConnected, setIsConnected] = useState<boolean>(false);

	const initializeSocket = useCallback(() => {
		const newSocket = io(SOCKET_URL, SOCKET_OPTIONS);
		setSocket(newSocket);

		newSocket.on('connect', () => setIsConnected(true));
		newSocket.on('disconnect', () => setIsConnected(false));
		newSocket.on('error', () => {
			newSocket.disconnect();
			setIsConnected(false);
		});

		return newSocket;
	}, []);

	useEffect(() => {
		const newSocket = initializeSocket();

		return () => {
			newSocket.disconnect();
		};
	}, [initializeSocket]);

	return { socket, isConnected };
};
