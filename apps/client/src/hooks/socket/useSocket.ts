import { useRef, useState, useCallback, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_SERVER_URL = 'http://localhost:3001';
const SOCKET_OPTIONS = { reconnection: true, reconnectionAttempts: 5, reconnectionDelay: 2000 };

export type EventHandler<T = unknown> = (data: T) => void;
export type EmitData<T = unknown> = T;

export const useSocket = () => {
	const socketRef = useRef<Socket | null>(null);
	const [isConnected, setIsConnected] = useState<boolean>(false);

	useEffect(() => {
		const socket = io(SOCKET_SERVER_URL, SOCKET_OPTIONS);
		socketRef.current = socket;

		socket.on('connect', () => {
			setIsConnected(true);
		});
		socket.on('disconnect', () => setIsConnected(false));
		socket.on('error', () => {
			socket.disconnect();
			setIsConnected(false);
		});

		return () => {
			socket.disconnect();
			socketRef.current = null;
			setIsConnected(false);
		};
	}, []);

	const addListener = useCallback(
		<T>(event: string, handler: EventHandler<T>) => {
			socketRef.current?.on(event, handler);
		},
		[socketRef.current]
	);

	const removeListener = useCallback(
		<T>(event: string, handler: EventHandler<T>) => {
			socketRef.current?.off(event, handler);
		},
		[socketRef.current]
	);

	const sendMessage = useCallback(
		<T>(event: string, data: EmitData<T>) => {
			socketRef.current?.emit(event, data);
		},
		[socketRef.current]
	);

	return { isConnected, addListener, removeListener, sendMessage };
};
