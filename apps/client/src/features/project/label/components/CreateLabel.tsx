import { useForm } from 'react-hook-form';
import { Plus, Shuffle } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
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

interface CreateLabelProps {
  onCreate: (data: LabelFormValues) => void;
}

export function CreateLabel({ onCreate }: CreateLabelProps) {
  const createForm = useForm<LabelFormValues>({
    resolver: zodResolver(labelFormSchema),
    defaultValues: {
      name: '',
      description: '',
      color: generateRandomColor(),
    },
  });

  const handleRandomColor = () => {
    createForm.setValue('color', generateRandomColor(), { shouldValidate: true });
  };

  const handleSubmit = (data: LabelFormValues) => {
    onCreate(data);
    createForm.reset({
      name: '',
      description: '',
      color: generateRandomColor(),
    });
  };

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="text-xl">Create Label</CardTitle>
        <CardDescription>Add a new label to your project.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={createForm.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name
                <Input
                  {...createForm.register('name')}
                  placeholder="Label name"
                  className="mt-1 h-10"
                  id="name"
                />
              </label>
              {createForm.formState.errors.name && (
                <p className="mt-1 text-sm text-red-500">
                  {createForm.formState.errors.name.message}
                </p>
              )}
            </div>
            <div className="flex">
              <div className="mt-1 flex min-w-[200px] items-end gap-2">
                <label
                  htmlFor="color"
                  className="block min-w-[160px] text-sm font-medium text-gray-700"
                >
                  Color
                  <ColorInput
                    value={createForm.watch('color')}
                    onChange={(value) => createForm.setValue('color', value)}
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
                {...createForm.register('description')}
                placeholder="Label description"
                className="mt-1"
                id="description"
              />
            </label>
            {createForm.formState.errors.description && (
              <p className="mt-1 text-sm text-red-500">
                {createForm.formState.errors.description.message}
              </p>
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
