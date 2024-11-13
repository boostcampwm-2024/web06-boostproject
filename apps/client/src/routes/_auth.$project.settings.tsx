import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/$project/settings')({
  component: RouteComponent,
});

function RouteComponent() {
  const { project } = Route.useParams();
  return <div>안녕하세요, {project} 설정 페이지</div>;
}
