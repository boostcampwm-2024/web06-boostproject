import { useState } from 'react';
import {
	Section,
	SectionContent,
	SectionFooter,
	SectionHeader,
	SectionTitle,
} from '@/components/ui/section.tsx';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card.tsx';
import Tag from '@/components/Tag';

const initialColumns = [
	{
		name: 'To Do',
		tasks: [
			{
				id: 1,
				title: 'Task 조회 API 구현 이렇게 태스크의 타이틀이 길다면 어떻게 ',
				description: 'Task 조회 API 구현',
				sectionName: 'To Do',
				position: '0|100000:',
			},
			{
				id: 2,
				title: 'Task 생성 API 구현',
				description: 'Task 생성 API 구현',
				sectionName: 'To Do',
				position: '0|100002:',
			},
			{
				id: 5,
				title: 'Task 삭제 API 구현',
				description: 'Task 삭제 API 구현',
				sectionName: 'To Do',
				position: '0|100004:',
			},
			{
				id: 6,
				title: 'Task 상세 조회 API 구현',
				description: 'Task 상세 조회 API 구현',
				sectionName: 'To Do',
				position: '0|100005:',
			},
			{
				id: 7,
				title: 'Task 상태 변경 API 구현',
				description: 'Task 상태 변경 API 구현',
				sectionName: 'To Do',
				position: '0|100007:',
			},
			{
				id: 8,
				title: 'Task 우선순위 변경 API 구현',
				description: 'Task 우선순위 변경 API 구현',
				sectionName: 'To Do',
				position: '0|100008:',
			},
			{
				id: 9,
				title: 'Task 담당자 변경 API 구현',
				description: 'Task 담당자 변경 API 구현',
				sectionName: 'To Do',
				position: '0|100009:',
			},
			{
				id: 10,
				title: 'Task 댓글 추가 API 구현',
				description: 'Task 댓글 추가 API 구현',
				sectionName: 'To Do',
				position: '0|100010:',
			},
		],
	},
	{
		name: 'In Progress',
		tasks: [
			{
				id: 3,
				title: 'Task 수정 API 구현',
				description: 'Task 수정 API 구현',
				sectionName: 'In Progress',
				position: '0|100003:',
			},
			{
				id: 11,
				title: 'Task 댓글 조회 API 구현',
				description: 'Task 댓글 조회 API 구현',
				sectionName: 'In Progress',
				position: '0|100011:',
			},
			{
				id: 12,
				title: 'Task 댓글 삭제 API 구현',
				description: 'Task 댓글 삭제 API 구현',
				sectionName: 'In Progress',
				position: '0|100012:',
			},
			{
				id: 13,
				title: 'Task 댓글 수정 API 구현',
				description: 'Task 댓글 수정 API 구현',
				sectionName: 'In Progress',
				position: '0|100013:',
			},
		],
	},
	{
		name: 'Done',
		tasks: [
			{
				id: 4,
				title: 'Task 이동 API 구현',
				description: 'Task 이동 API 구현',
				sectionName: 'Done',
				position: '0|100006:',
			},
		],
	},
];

interface Task {
	id: number;
	title: string;
	description: string;
	sectionName: string;
	position: string;
}

interface Section {
	name: string;
	tasks: Task[];
}

function Kanban() {
	const [columns] = useState<Section[]>(initialColumns);
	return (
		<div className="flex h-[calc(100vh-110px)] flex-col">
			<div className="flex flex-1 space-x-2 overflow-x-auto p-4">
				{columns.map((column) => (
					<Section
						key={column.name}
						className="flex h-fit max-h-[calc(100vh-142px)] w-96 flex-shrink-0 flex-col bg-gray-50"
					>
						<SectionHeader>
							<SectionTitle className="text-xl">{column.name}</SectionTitle>
						</SectionHeader>
						<SectionContent className="flex-1 overflow-y-auto">
							<div className="space-y-2">
								{column.tasks.map((task) => (
									<Card key={task.id} className="bg-[#ffffff]">
										<CardHeader className="flex flex-row items-start gap-2">
											<CardTitle className="text-md mt-1.5 flex flex-1 break-keep">
												{task.title}
											</CardTitle>
											<div className="mt-0 inline-flex h-8 w-8 rounded-full bg-amber-200" />
										</CardHeader>
										<CardContent className="flex gap-1">
											<Tag text="Feature" />
											<Tag text="FE" className="bg-pink-400" />
										</CardContent>
										<CardFooter className="flex justify-start">
											<p className="text-gray-500">+ 서브 태스크 추가</p>
										</CardFooter>
									</Card>
								))}
							</div>
						</SectionContent>
						<SectionFooter className="font-medium text-gray-600">+ 태스크 추가</SectionFooter>
					</Section>
				))}
			</div>
		</div>
	);
}

export default Kanban;
