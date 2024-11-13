import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/$project/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { project } = Route.useParams();
  return <div>안녕하세요, {project} 대시보드 페이지</div>;
}
