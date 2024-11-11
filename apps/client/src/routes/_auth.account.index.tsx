import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/account/')({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div>
			<h2>참여중인 프로젝트 목록 조회 페이지</h2>
		</div>
	);
}
