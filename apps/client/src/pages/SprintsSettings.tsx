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

  return (
    <div className="space-y-6">
      <SprintList
        sprints={sprints}
        updateMutation={updateMutation}
        deleteMutation={deleteMutation}
      />
      <CreateSprint createMutation={createMutation} />
    </div>
  );
}
