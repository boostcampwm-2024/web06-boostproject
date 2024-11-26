import { useForm } from 'react-hook-form';
import { Plus, Shuffle } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { UseMutationResult } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { Input } from '@/components/ui/input.tsx';
import { Button } from '@/components/ui/button.tsx';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card.tsx';

import { ColorInput } from '@/features/project/label/components/ColorInput.tsx';
import { generateRandomColor } from '@/features/project/label/generateRandomColor.ts';
import { labelFormSchema, LabelFormValues } from '@/features/project/label/labelSchema.ts';
import { BaseResponse } from '@/features/types.ts';
import { CreateLabelDto } from '@/features/project/types.ts';
import { useToast } from '@/lib/useToast.tsx';

interface CreateLabelProps {
  createMutation: UseMutationResult<BaseResponse, AxiosError, CreateLabelDto>;
}

export function CreateLabel({ createMutation }: CreateLabelProps) {
  const toast = useToast();

  const { mutate } = createMutation;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors },
  } = useForm<LabelFormValues>({
    resolver: zodResolver(labelFormSchema),
    defaultValues: {
      name: '',
      description: '',
      color: generateRandomColor(),
    },
  });

  const onCreate = (data: LabelFormValues) => {
    mutate(
      {
        name: data.name.trim(),
        description: data.description.trim(),
        color: data.color,
      },
      { onSuccess, onError }
    );
  };

  const onSuccess = () => {
    toast.success('Label created successfully');
    setValue('name', '');
    setValue('description', '');
    setValue('color', generateRandomColor());
  };

  const onError = (error: AxiosError) => {
    if (error?.response?.status === 409) {
      setError('name', {
        message: 'Label with this name already exists',
      });
      return;
    }

    toast.error('Failed to create label');
  };

  const handleRandomColor = () => {
    setValue('color', generateRandomColor(), { shouldValidate: true });
  };

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="text-xl">Create Label</CardTitle>
        <CardDescription>Add a new label to your project.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onCreate)} className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name
                <Input
                  {...register('name')}
                  placeholder="Label name"
                  className="mt-1 h-10"
                  id="name"
                />
              </label>
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
            </div>
            <div className="flex">
              <div className="mt-1 flex min-w-[200px] items-end gap-2">
                <label
                  htmlFor="color"
                  className="block min-w-[160px] text-sm font-medium text-gray-700"
                >
                  Color
                  <ColorInput
                    value={watch('color')}
                    onChange={(value) => setValue('color', value)}
                    className="flex-1"
                  />
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleRandomColor}
                  className="h-10 w-10 flex-shrink-0"
                >
                  <Shuffle className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <div className="flex-1">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
              <Input
                {...register('description')}
                placeholder="Label description"
                className="mt-1"
                id="description"
              />
            </label>
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full bg-black hover:bg-black/80">
            <Plus className="mr-2 h-4 w-4" />
            Create Label
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
