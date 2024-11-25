import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectAPI } from '@/features/project/api.ts';
import { CreateLabelDto, UpdateLabelDto } from '@/features/project/types.ts';

export const useLabelMutations = (projectId: number) => {
  const queryCleint = useQueryClient();

  const invalidateLabels = () => {
    queryCleint.invalidateQueries({
      queryKey: ['labels', projectId],
    });
  };

  return {
    create: useMutation({
      mutationFn: (createLabelDto: CreateLabelDto) =>
        projectAPI.createLabel(projectId, createLabelDto),
      onSuccess: invalidateLabels,
    }),

    update: useMutation({
      mutationFn: ({
        labelId,
        updateLabelDto,
      }: {
        labelId: number;
        updateLabelDto: UpdateLabelDto;
      }) => projectAPI.updateLabel(labelId, updateLabelDto),
      onSuccess: invalidateLabels,
    }),

    delete: useMutation({
      mutationFn: (labelId: number) => projectAPI.deleteLabel(labelId),
      onSuccess: invalidateLabels,
    }),
  };
};
