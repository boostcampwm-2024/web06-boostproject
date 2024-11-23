import { useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { Assignee, Label, Sprint as TSprint } from '@/details/types.tsx';
import Assignees from '@/details/Assignees.tsx';
import Labels from '@/details/Labels.tsx';
import Priority from '@/details/Priority.tsx';
import Sprint from '@/details/Sprint.tsx';
import Estimate from '@/details/Estimate.tsx';

export default function DetailSidebar() {
  // assignees
  const assignees: Assignee[] = [
    {
      id: 1,
      username: 'PMtHk',
      avatar: '',
    },
    {
      id: 2,
      username: 'jjeonghak',
      avatar: '',
    },
    {
      id: 3,
      username: 'iam454',
      avatar: '',
    },
    {
      id: 4,
      username: 'yangchef01',
      avatar: '',
    },
  ] as const;
  const [selectedAssignees, setSelectedAssignees] = useState<number[]>([]);

  // labels
  const labels: Label[] = [
    {
      id: 1,
      name: 'Bug',
      color: '#cf3728',
    },
    {
      id: 2,
      name: 'Feature',
      color: '#278ddb',
    },
    {
      id: 3,
      name: 'Enhancement',
      color: '#f0ad4e',
    },
  ] as const;
  const [selectedLabels, setSelectedLabels] = useState<number[]>([]);

  // priority
  const [priority, setPriority] = useState<number | null>(null);

  // sprint
  const sprints: TSprint[] = [
    {
      id: 1,
      name: 'Week 1',
      startDate: '2024-11-04',
      endDate: '2024-11-10',
    },
    {
      id: 2,
      name: 'Week 2',
      startDate: '2024-11-11',
      endDate: '2024-11-17',
    },
  ] as const;
  const [selectedSprint, setSelectedSprint] = useState<TSprint | null>(null);

  // estimate
  const [estimate, setEstimate] = useState<number | null>(null);

  return (
    <div className="space-y-5 pb-4">
      <Assignees
        assignees={assignees}
        selectedAssignees={selectedAssignees}
        setSelectedAssignees={setSelectedAssignees}
      />
      <Separator className="rounded-full bg-gray-300" />

      <Labels
        labels={labels}
        selectedLabels={selectedLabels}
        setSelectedLabels={setSelectedLabels}
      />
      <Separator className="rounded-full bg-gray-300" />

      <Priority priority={priority} setPriority={setPriority} />
      <Separator className="rounded-full bg-gray-300" />

      <Sprint
        sprints={sprints}
        selectedSprint={selectedSprint}
        setSelectedSprint={setSelectedSprint}
      />
      <Separator className="rounded-full bg-gray-300" />

      <Estimate estimate={estimate} setEstimate={setEstimate} />
    </div>
  );
}
