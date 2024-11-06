import { useEffect, useState } from 'react';
import { useSocket, EventHandler } from '@/hooks/socket/useSocket';

type Task = {
	id: string;
	title: string;
	description: string;
};

// 태스크 소켓 이벤트 타입 정의
type TaskEvent = {
	add: {
		id: string;
		title: string;
		description: string;
	};
	update: {
		id: string;
		title?: string;
		description?: string;
	};
	delete: { id: string };
};

export const useTaskSocket = () => {
	const { isConnected, addListener, removeListener, sendMessage } = useSocket();
	const [tasks, setTasks] = useState<Task[]>([]);

	const addTask = (task: Task) => {
		sendMessage<TaskEvent['add']>('task:add', task);
		setTasks((prevTasks) => [...prevTasks, task]);
	};

	const handleTaskAdded: EventHandler<TaskEvent['add']> = (task) => {
		setTasks((prevTasks) => [...prevTasks, task]);
	};

	const updateTask = (task: Task) => {
		sendMessage<TaskEvent['update']>('task:update', task);
	};

	const handleTaskUpdated: EventHandler<TaskEvent['update']> = (task) => {
		setTasks((prevTasks) => prevTasks.map((t) => (t.id === task.id ? { ...t, ...task } : t)));
	};

	const deleteTask = (taskId: string) => {
		sendMessage<TaskEvent['delete']>('task:delete', { id: taskId });
	};

	const handleTaskDeleted: EventHandler<TaskEvent['delete']> = ({ id }) => {
		setTasks((prevTasks) => prevTasks.filter((t) => t.id !== id));
	};

	useEffect(() => {
		addListener('task:add', handleTaskAdded);
		addListener('task:update', handleTaskUpdated);
		addListener('task:delete', handleTaskDeleted);

		// Cleanup: 컴포넌트 언마운트 시 리스너 제거
		return () => {
			removeListener('task:add', handleTaskAdded);
			removeListener('task:update', handleTaskUpdated);
			removeListener('task:delete', handleTaskDeleted);
		};
	}, [addListener, removeListener]);

	return {
		isConnected,
		tasks,
		addTask,
		updateTask,
		deleteTask,
	};
};
