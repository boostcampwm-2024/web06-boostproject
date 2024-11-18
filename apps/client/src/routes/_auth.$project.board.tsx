import { createFileRoute } from '@tanstack/react-router';
import Board from '@/pages/Board.tsx';

export const Route = createFileRoute('/_auth/$project/board')({
  component: Board,
});
