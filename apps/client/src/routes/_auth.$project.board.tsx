import { createFileRoute } from '@tanstack/react-router';
import Board from '@/pages/Board.tsx';
import { TasksResponse } from '@/components/KanbanBoard.tsx';
import { axiosInstance } from '@/lib/axios.ts';

export const Route = createFileRoute('/_auth/$project/board')({
  loader: ({ context: { queryClient }, params: { project: projectId } }) => {
    queryClient.ensureQueryData({
      queryKey: ['tasks', projectId],
      queryFn: async () => {
        const response = await axiosInstance.get<TasksResponse>(`/task?projectId=${projectId}`);

        return response.data.result;
      },
    });
  },
  onError: (error) => {
    console.error(error);
  },
  component: Board,
});
