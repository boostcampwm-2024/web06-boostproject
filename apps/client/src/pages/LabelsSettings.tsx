import { useLoaderData } from '@tanstack/react-router';
import { useLabelsQuery } from '@/features/project/label/useLabelsQuery.ts';
import { useLabelMutations } from '@/features/project/label/useLabelMutations.ts';
import { LabelList } from '@/features/project/label/components/LabelList.tsx';
import { CreateLabel } from '@/features/project/label/components/CreateLabel.tsx';

export default function LabelsSettings() {
  const { projectId } = useLoaderData({ from: '/_auth/$project/settings/labels' });

  const { data: labels = [] } = useLabelsQuery(projectId);

  const {
    create: createMutation,
    update: updateMutation,
    delete: deleteMutation,
  } = useLabelMutations(projectId);

  return (
    <div className="space-y-6">
      <LabelList labels={labels} updateMutation={updateMutation} deleteMutation={deleteMutation} />
      <CreateLabel createMutation={createMutation} />
    </div>
  );
}
