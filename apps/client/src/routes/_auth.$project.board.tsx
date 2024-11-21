import axios from 'axios';
import { createFileRoute } from '@tanstack/react-router';
import Board from '@/pages/Board.tsx';
import { TasksResponse } from '@/components/KanbanBoard.tsx';

export const Route = createFileRoute('/_auth/$project/board')({
  loader: ({ context: { auth, queryClient }, params: { project: projectId } }) => {
    queryClient.ensureQueryData({
      queryKey: ['tasks', projectId],
      queryFn: async () => {
        const response = await axios.get<TasksResponse>(`/api/task?projectId=${projectId}`, {
          headers: { Authorization: `Bearer ${auth.accessToken}` },
        });

        return response.data.result;
      },
    });
  },
  onError: (error) => {
    console.error(error);
  },
  component: Board,
});
