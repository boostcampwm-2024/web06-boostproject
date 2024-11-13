import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/$project/board')({
  component: RouteComponent,
});

function RouteComponent() {
  const { project } = Route.useParams();
  return <div>안녕하세요, {project} 칸반 보드 페이지</div>;
}
