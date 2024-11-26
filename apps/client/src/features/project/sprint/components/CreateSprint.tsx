import { AxiosError } from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { Plus } from 'lucide-react';
import { UseMutationResult } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { sprintFormSchema, SprintFormValues } from '@/features/project/sprint/sprintSchema.ts';
import { BaseResponse } from '@/features/types.ts';
import { CreateSprintDto } from '@/features/project/types.ts';
import { useToast } from '@/lib/useToast.tsx';

interface CreateProjectSprintProps {
  createMutation: UseMutationResult<BaseResponse, AxiosError, CreateSprintDto>;
}

const 일주일 = 7 * 24 * 60 * 60 * 1000;

export function CreateSprint({ createMutation }: CreateProjectSprintProps) {
  const toast = useToast();

  const { mutate } = createMutation;

  const {
    register,
    handleSubmit,
    control,
    setError,
    setValue,
    formState: { errors },
  } = useForm<SprintFormValues>({
    resolver: zodResolver(sprintFormSchema),
    defaultValues: {
      name: '',
      dateRange: {
        from: new Date(),
        to: new Date(new Date().getTime() + 일주일),
      },
    },
  });

  const onCreate = (data: SprintFormValues) => {
    mutate(
      {
        name: data.name.trim(),
        startDate: data.dateRange.from.toISOString().split('T')[0],
        endDate: data.dateRange.to.toISOString().split('T')[0],
      },
      { onSuccess, onError }
    );
  };

  const onSuccess = () => {
    toast.success('Sprint created successfully');
    setValue('name', '');
    setValue('dateRange', {
      from: new Date(),
      to: new Date(new Date().getTime() + 일주일),
    });
  };

  const onError = (error: AxiosError) => {
    if (error?.response?.status === 409) {
      setError('name', {
        message: 'Sprint with this name already exists',
      });
    }

    toast.error('Failed to create sprint');
  };

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="text-xl">Create Sprint</CardTitle>
        <CardDescription>Add a new sprint to your project.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onCreate)} className="space-y-4">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name
                <Input {...register('name')} placeholder="Sprint name" className="mt-1" id="name" />
              </label>
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block w-fit text-sm font-medium text-gray-700">
                Duration
                <div className="mt-1">
                  <Controller
                    control={control}
                    name="dateRange"
                    render={({ field }) => (
                      <DateRangePicker date={field.value} onChange={field.onChange} />
                    )}
                  />
                  {errors.dateRange && (
                    <p className="mt-1 text-sm text-red-500">{errors.dateRange.message}</p>
                  )}
                </div>
              </label>
            </div>
          </div>
          <Button type="submit" className="w-full bg-black hover:bg-black/80">
            <Plus className="mr-2 h-4 w-4" />
            Create Sprint
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
