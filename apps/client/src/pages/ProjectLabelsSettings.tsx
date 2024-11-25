import { useState } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLoaderData } from '@tanstack/react-router';
import { Pencil, Plus, X, Shuffle } from 'lucide-react';
import { Input } from '@/components/ui/input.tsx';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Label } from '@/details/types.tsx';
import { generateRandomColor } from '@/pages/generateRandomColor.ts';
import { ColorInput } from '@/pages/ColorInput.tsx';
import { useLabelsQuery } from '@/features/project/useLabelsQuery.ts';
import { useLabelMutations } from '@/features/project/useLabelMutations.ts';

const formSchema = z.object({
  name: z.string().min(1, 'Label name is required'),
  description: z.string().min(1, 'Label description is required'),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Must be a valid hex color'),
});

interface LabelFormValues {
  name: string;
  description: string;
  color: string;
}

export default function ProjectLabelsSettings() {
  const { projectId } = useLoaderData({ from: '/_auth/$project/settings/labels' });
  const {
    data: labels = [
      {
        id: 1,
        name: 'Bug',
        description: 'Something is broken',
        color: '#FF0000',
      },
    ],
  } = useLabelsQuery(projectId);
  const {
    create: createMutation,
    update: updateMutation,
    delete: deleteMutation,
  } = useLabelMutations(projectId);

  const [editingId, setEditingId] = useState<number | null>(null);

  const createForm = useForm<LabelFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      color: generateRandomColor(),
    },
  });

  const editForm = useForm<LabelFormValues>({
    resolver: zodResolver(formSchema),
  });

  const startEditing = (label: Label) => {
    setEditingId(label.id);
    editForm.reset({
      name: label.name,
      description: label.description,
      color: label.color,
    });
  };

  const handleRandomColor = (form: UseFormReturn<LabelFormValues>) => {
    form.setValue('color', generateRandomColor(), { shouldValidate: true });
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-xl">Labels</CardTitle>
          <CardDescription>Manage existing labels.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {labels.map((label: Label) => (
              <div
                key={label.id}
                className="flex items-center justify-between rounded-lg border bg-[#fafafa] p-4"
              >
                {editingId === label.id ? (
                  <form
                    className="flex w-full flex-col gap-4"
                    onSubmit={editForm.handleSubmit((data) =>
                      updateMutation.mutate({
                        labelId: label.id,
                        updateLabelDto: {
                          name: data.name,
                          description: data.description,
                          color: data.color,
                        },
                      })
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <Input
                        {...editForm.register('name')}
                        className="h-10 flex-1"
                        placeholder="Name"
                      />
                      <div className="flex min-w-[200px] gap-2">
                        <ColorInput
                          value={editForm.watch('color')}
                          onChange={(value) => editForm.setValue('color', value)}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => handleRandomColor(editForm)}
                          className="h-10 w-10 flex-shrink-0"
                        >
                          <Shuffle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <Input
                        {...editForm.register('description')}
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
                    {editForm.formState.errors.description && (
                      <p className="text-sm text-red-500">
                        {editForm.formState.errors.description.message}
                      </p>
                    )}
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
                        onClick={() => deleteMutation.mutate(label.id)}
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
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-xl">Create Label</CardTitle>
          <CardDescription>Add a new label to your project.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={createForm.handleSubmit((data) => createMutation.mutate(data))}
            className="space-y-4"
          >
            <div className="flex gap-4">
              <div className="flex-1">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Name
                  <Input
                    {...createForm.register('name')}
                    placeholder="Label name"
                    className="mt-1 h-10"
                    id="name"
                    name="name"
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
                    onClick={() => handleRandomColor(createForm)}
                    className="h-10 w-10 flex-shrink-0"
                  >
                    <Shuffle className="h-4 w-4" />
                  </Button>
                </div>
                {createForm.formState.errors.color && (
                  <p className="mt-1 text-sm text-red-500">
                    {createForm.formState.errors.color.message}
                  </p>
                )}
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
                  name="description"
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
    </div>
  );
}
