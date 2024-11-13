import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/account/settings')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <h2>계정 설정 페이지</h2>
    </div>
  );
}
