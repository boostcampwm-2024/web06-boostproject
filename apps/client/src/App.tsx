import { useState } from 'react';
import { Button } from '@/components/ui/button.tsx';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './components/ui/card';
import {
	Section,
	SectionContent,
	SectionDescription,
	SectionFooter,
	SectionHeader,
	SectionTitle,
} from './components/ui/section';

const initialColumns = [
	{
		id: '0',
		title: '할 일',
		tasks: [
			{ id: '1', title: '프로젝트 계획 수립' },
			{ id: '2', title: '디자인 초안 작성' },
			{
				id: '5',
				title: `Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publish`,
			},
			{ id: '6', title: '디자인 초안 작성' },
			{ id: '7', title: '디자인 초안 작성' },
			{ id: '8', title: '디자인 초안 작성' },
			{ id: '9', title: '디자인 초안 작성' },
			{ id: '10', title: '디자인 초안 작성' },
		],
	},
	{
		id: '1',
		title: '진행 중',
		tasks: [
			{ id: '3', title: '프론트엔드 개발' },
			{ id: '11', title: '프론트엔드 개발' },
		],
	},
	{
		id: '2',
		title: '완료',
		tasks: [{ id: '4', title: '요구사항 분석' }],
	},
];

function App() {
	const [columns, setColumns] = useState(initialColumns); // eslint-disable-line @typescript-eslint/no-unused-vars

	return (
		<div className="flex h-screen flex-col">
			<div className="p-4">
				<h1 className="text-primary pt-2">Welcome to Harmony!</h1>
				<p>Harmony 는 일정관리 서비스입니다.</p>
				<Button>default</Button>
				<Button variant="destructive">destructive</Button>
				<Button variant="secondary">secondary</Button>
				<Button variant="outline">outline</Button>
				<Button variant="ghost">ghost</Button>
				<Button variant="link">link</Button>
			</div>

			<div className="flex flex-1 space-x-2 overflow-x-auto p-4">
				{columns.map((column) => (
					<Section key={column.id} className="flex w-80 flex-shrink-0 flex-col bg-[#f7f8f9]">
						<SectionHeader>
							<SectionTitle>{column.title}</SectionTitle>
							<SectionDescription>섹션에 대한 추가 설명도 필요할까?</SectionDescription>
						</SectionHeader>
						<SectionContent className="flex-1 overflow-y-auto">
							<div className="space-y-2">
								{column.tasks.map((task) => (
									<Card key={task.id} className="bg-[#ffffff]">
										<CardHeader>
											<CardTitle>{task.title}</CardTitle>
										</CardHeader>
										<CardContent>라벨1 라벨2 라벨3</CardContent>
										<CardFooter>하위 이슈를 아코디언 형식으로 보여줄 것인가?</CardFooter>
									</Card>
								))}
							</div>
						</SectionContent>
						<SectionFooter>+ 이슈 만들기</SectionFooter>
					</Section>
				))}
			</div>
		</div>
	);
}

export default App;
