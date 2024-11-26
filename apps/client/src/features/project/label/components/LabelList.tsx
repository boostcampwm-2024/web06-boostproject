import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Pencil, X, Shuffle } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { UseMutationResult } from '@tanstack/react-query';
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
import { BaseResponse, Label } from '@/features/types.ts';
import { UpdateLabelDto } from '@/features/project/types.ts';
import { useToast } from '@/lib/useToast.tsx';

interface LabelListProps {
  labels: Label[];
  updateMutation: UseMutationResult<
    BaseResponse,
    AxiosError,
    {
      labelId: number;
      updateLabelDto: UpdateLabelDto;
    }
  >;
  deleteMutation: UseMutationResult<BaseResponse, AxiosError, number>;
}

export function LabelList({ labels, updateMutation, deleteMutation }: LabelListProps) {
  const toast = useToast();

  const [editingId, setEditingId] = useState<number | null>(null);

  const { mutate: updateLabel } = updateMutation;

  const { mutate: deleteLabel } = deleteMutation;

  const {
    handleSubmit,
    register,
    watch,
    setValue,
    setError,
    reset,
    formState: { errors },
  } = useForm<LabelFormValues>({
    resolver: zodResolver(labelFormSchema),
  });

  const startEditing = (label: Label) => {
    setEditingId(label.id);
    reset({
      name: label.name,
      description: label.description,
      color: label.color,
    });
  };

  const onUpdate = (labelId: number, data: LabelFormValues) => {
    updateLabel(
      {
        labelId,
        updateLabelDto: {
          name: data.name.trim(),
          description: data.description.trim(),
          color: data.color,
        },
      },
      { onSuccess: onUpdateSuccess, onError: onUpdateError }
    );
  };

  const onDelete = (labelId: number) => {
    deleteLabel(labelId, {
      onSuccess: onDeleteSuccess,
      onError: onDeleteError,
    });
  };

  const onUpdateSuccess = () => {
    toast.success('Label updated successfully');
    setEditingId(null);
  };

  const onUpdateError = (error: AxiosError) => {
    if (error?.response?.status === 409) {
      setError('name', {
        message: 'Label with this name already exists',
      });
      return;
    }

    toast.error('Label update failed');
  };

  const onDeleteSuccess = () => {
    toast.success('Label deleted successfully');
  };

  const onDeleteError = () => {
    toast.error('Label deletion failed');
  };

  const handleRandomColor = () => {
    setValue('color', generateRandomColor(), { shouldValidate: true });
  };

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="text-xl">Labels</CardTitle>
        <CardDescription>Manage existing labels.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {labels.map((label) => (
            <div
              key={label.id}
              className="flex items-center justify-between rounded-lg border bg-[#fafafa] p-4"
            >
              {editingId === label.id ? (
                <form
                  className="flex w-full flex-col gap-4"
                  onSubmit={handleSubmit((data) => {
                    onUpdate(label.id, data);
                  })}
                >
                  <div className="flex items-start gap-4">
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
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
                      )}
                    </div>
                    <div className="mt-6 flex min-w-[200px] gap-2">
                      <ColorInput
                        value={watch('color')}
                        onChange={(value) => setValue('color', value)}
                        className="flex-1"
                      />
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
                  <div className="flex gap-4">
                    <Input
                      {...register('description')}
                      className="flex-1"
                      placeholder="Description"
                    />
                    <div className="flex gap-2">
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
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex items-center space-x-4">
                    <div className="h-6 w-6 rounded" style={{ backgroundColor: label.color }} />
                    <div>
                      <p className="font-medium">{label.name}</p>
                      <p className="text-sm text-gray-500">{label.description}</p>
                      <p className="text-sm text-gray-400">{label.color}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => startEditing(label)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(label.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
