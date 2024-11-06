import { useCallback } from 'react';
import { useSocketConnection } from '@/hooks/socket/useSocketConnection';

export const useSocket = () => {
	const { socket, isConnected } = useSocketConnection();

	const addListener = useCallback(
		(event: string, eventHandler: (...args: unknown[]) => void) => {
			if (socket) {
				socket.on(event, eventHandler);
			}
		},
		[socket]
	);

	const removeListener = useCallback(
		(event: string, eventHandler: (...args: unknown[]) => void) => {
			if (socket) {
				socket.off(event, eventHandler);
			}
		},
		[socket]
	);

	const sendMessage = useCallback(
		(event: string, data: unknown) => {
			if (socket) {
				socket.emit(event, data);
			}
		},
		[socket]
	);

	return { isConnected, addListener, removeListener, sendMessage };
};
