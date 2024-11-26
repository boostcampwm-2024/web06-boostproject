import { AxiosError } from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectAPI } from '@/features/project/api.ts';
import { CreateLabelDto, UpdateLabelDto } from '@/features/project/types.ts';
import { BaseResponse } from '@/features/types.ts';

export const useLabelMutations = (projectId: number) => {
  const queryCleint = useQueryClient();

  const invalidateLabels = () => {
    queryCleint.invalidateQueries({
      queryKey: ['labels', projectId],
    });
  };

  return {
    create: useMutation<BaseResponse, AxiosError, CreateLabelDto>({
      mutationFn: (createLabelDto) => projectAPI.createLabel(projectId, createLabelDto),
      onSuccess: invalidateLabels,
    }),

    update: useMutation<
      BaseResponse,
      AxiosError,
      {
        labelId: number;
        updateLabelDto: UpdateLabelDto;
      }
    >({
      mutationFn: ({ labelId, updateLabelDto }) => projectAPI.updateLabel(labelId, updateLabelDto),
      onSuccess: invalidateLabels,
    }),

    delete: useMutation<BaseResponse, AxiosError, number>({
      mutationFn: (labelId) => projectAPI.deleteLabel(labelId),
      onSuccess: invalidateLabels,
    }),
  };
};
