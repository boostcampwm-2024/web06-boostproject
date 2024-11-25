import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateLabelDto, UpdateLabelDto } from '@/features/project/types.ts';
import { projectAPI } from '@/features/project/api.ts';

export const useLabelUpdate = (projectId: number) => {
  const queryCleint = useQueryClient();

  return {
    create: useMutation({
      mutationFn: (createLabelDto: CreateLabelDto) =>
        projectAPI.createLabel(projectId, createLabelDto),
      onSuccess: () => {
        queryCleint.invalidateQueries({
          queryKey: ['labels', projectId],
        });
      },
    }),

    update: useMutation({
      mutationFn: ({
        labelId,
        updateLabelDto,
      }: {
        labelId: number;
        updateLabelDto: UpdateLabelDto;
      }) => projectAPI.updateLabel(labelId, updateLabelDto),
      onSuccess: () => {
        queryCleint.invalidateQueries({
          queryKey: ['labels', projectId],
        });
      },
    }),

    delete: useMutation({
      mutationFn: (labelId: number) => projectAPI.deleteLabel(labelId),
      onSuccess: () => {
        queryCleint.invalidateQueries({
          queryKey: ['labels', projectId],
        });
      },
    }),
  };
};
