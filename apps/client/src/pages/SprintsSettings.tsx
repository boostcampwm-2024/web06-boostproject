import { useLoaderData } from '@tanstack/react-router';
import { useSprintsQuery } from '@/features/project/sprint/useSprintsQuery';
import { useSprintMutations } from '@/features/project/sprint/useSprintMutations';
import { SprintList } from '@/features/project/sprint/components/SprintList.tsx';
import { CreateSprint } from '@/features/project/sprint/components/CreateSprint.tsx';

export default function SprintsSettings() {
  const { projectId } = useLoaderData({ from: '/_auth/$project/settings/sprints' });
  const { data: sprints = [] } = useSprintsQuery(projectId);
  const {
    create: createMutation,
    update: updateMutation,
    delete: deleteMutation,
  } = useSprintMutations(projectId);

  const dateToYYYYMMDD = (date: Date) => date.toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      <SprintList
        sprints={sprints}
        onUpdate={(sprintId, data) =>
          updateMutation.mutate({
            sprintId,
            updateSprintDto: {
              name: data.name,
              startDate: dateToYYYYMMDD(data.dateRange.from),
              endDate: dateToYYYYMMDD(data.dateRange.to),
            },
          })
        }
        onDelete={(sprintId) => deleteMutation.mutate(sprintId)}
      />

      <CreateSprint createMutation={createMutation} />
    </div>
  );
}
