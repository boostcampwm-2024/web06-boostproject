import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil, X } from 'lucide-react';
import { UseMutationResult } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { sprintFormSchema, SprintFormValues } from '@/features/project/sprint/sprintSchema.ts';
import { getStatusColor } from '@/features/project/sprint/getStatusColor.ts';
import { getSprintStatus } from '@/features/project/sprint/getSprintStatus.ts';
import { BaseResponse, Sprint } from '@/features/types.ts';

import { UpdateSprintDto } from '@/features/project/types.ts';
import { useToast } from '@/lib/useToast.tsx';

interface ProjectSprintManagerProps {
  sprints: Sprint[];
  updateMutation: UseMutationResult<
    BaseResponse,
    AxiosError,
    {
      sprintId: number;
      updateSprintDto: UpdateSprintDto;
    }
  >;
  deleteMutation: UseMutationResult<BaseResponse, AxiosError, number>;
}

export function SprintList({ sprints, updateMutation, deleteMutation }: ProjectSprintManagerProps) {
  const toast = useToast();

  const [editingId, setEditingId] = useState<number | null>(null);

  const { mutate: updateSprint } = updateMutation;

  const { mutate: deleteSprint } = deleteMutation;

  const {
    handleSubmit,
    register,
    setError,
    control,
    reset,
    formState: { errors },
  } = useForm<SprintFormValues>({
    resolver: zodResolver(sprintFormSchema),
  });

  const startEditing = (sprint: Sprint) => {
    setEditingId(sprint.id);
    reset({
      name: sprint.name,
      dateRange: {
        from: new Date(sprint.startDate),
        to: new Date(sprint.endDate),
      },
    });
  };

  const dateToYYYYMMDD = (date: Date) => date.toISOString().split('T')[0];

  const onUpdate = (sprintId: number, data: SprintFormValues) => {
    updateSprint(
      {
        sprintId,
        updateSprintDto: {
          name: data.name,
          startDate: dateToYYYYMMDD(data.dateRange.from),
          endDate: dateToYYYYMMDD(data.dateRange.to),
        },
      },
      { onSuccess: onUpdateSuccess, onError: onUpdateError }
    );
  };

  const onDelete = (sprintId: number) => {
    deleteSprint(sprintId, { onSuccess: onDeleteSuccess, onError: onDeleteError });
  };

  const onUpdateSuccess = () => {
    toast.success('Sprint updated successfully');
    setEditingId(null);
  };

  const onUpdateError = (error: AxiosError) => {
    if (error.response?.status === 409) {
      setError('name', { message: 'Sprint with this name already exists' });
      return;
    }

    toast.error('Failed to update sprint');
  };

  const onDeleteSuccess = () => {
    toast.success('Sprint deleted successfully');
  };

  const onDeleteError = () => {
    toast.error('Failed to delete sprint');
  };

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="text-xl">Sprints</CardTitle>
        <CardDescription>Manage existing sprints.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {sprints.map((sprint) => (
            <div
              key={sprint.id}
              className="flex items-center justify-between rounded-lg border bg-[#fafafa] p-4"
            >
              {editingId === sprint.id ? (
                <form
                  className="flex w-full flex-wrap gap-4"
                  onSubmit={handleSubmit((data) => {
                    onUpdate(sprint.id, data);
                  })}
                >
                  <div className="flex-1">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Name
                      <Input
                        {...register('name')}
                        placeholder="Label name"
                        className="mt-1"
                        id="name"
                      />
                    </label>
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
                    )}
                  </div>
                  <div className="mt-6">
                    <Controller
                      control={control}
                      name="dateRange"
                      render={({ field }) => (
                        <DateRangePicker date={field.value} onChange={field.onChange} />
                      )}
                    />
                  </div>
                  <div className="flex w-full gap-2">
                    <Button type="submit" size="sm">
                      Save
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex flex-col">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium">{sprint.name}</p>
                      <Badge
                        variant="secondary"
                        className={getStatusColor(
                          getSprintStatus(sprint.startDate, sprint.endDate)
                        )}
                      >
                        {getSprintStatus(sprint.startDate, sprint.endDate)}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      {sprint.startDate} ~ {sprint.endDate}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => startEditing(sprint)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(sprint.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}

          {sprints.length === 0 && (
            <div className="py-4 text-center text-gray-500">No Sprints found</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
