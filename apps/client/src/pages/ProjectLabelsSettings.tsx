import { ChangeEvent, useState } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import axios from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from '@tanstack/react-router';
import { Pencil, Plus, X, Shuffle } from 'lucide-react';
import { Input } from '@/components/ui/input.tsx';
import { useAuth } from '@/contexts/authContext.tsx';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Label } from '@/details/types.tsx';

const formSchema = z.object({
  name: z.string().min(1, 'Label name is required'),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Must be a valid hex color'),
});

const generateRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i += 1) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

interface ColorInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

function ColorInput({ value, onChange, className = '' }: ColorInputProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={`border-input relative h-10 w-full rounded-md border ${className}`}>
      <input
        type="color"
        value={value}
        onChange={handleChange}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      />
      <div className="flex h-full items-center px-3 text-sm">{value}</div>
      <div
        className="absolute right-0 top-0 h-full w-10 rounded-r-md"
        style={{ backgroundColor: value }}
      />
    </div>
  );
}

interface LabelFormValues {
  name: string;
  color: string;
}

export default function ProjectLabelsSettings() {
  const auth = useAuth();
  const { project } = useParams({ from: '/_auth/$project/settings' });
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<number | null>(null);

  const labels = [
    { id: 1, name: 'Bug', color: '#f44336' },
    { id: 2, name: 'Feature', color: '#4caf50' },
  ];

  const createForm = useForm<LabelFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      color: generateRandomColor(),
    },
  });

  const editForm = useForm<LabelFormValues>({
    resolver: zodResolver(formSchema),
  });

  const createMutation = useMutation({
    mutationFn: async (data: LabelFormValues) => {
      await axios.post(`/api/project/${project}/labels`, data, {
        headers: { Authorization: `Bearer ${auth.accessToken}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', project, 'labels'] });
      createForm.reset({ name: '', color: '#000000' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & LabelFormValues) => {
      await axios.put(`/api/project/${project}/labels/${id}`, data, {
        headers: { Authorization: `Bearer ${auth.accessToken}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', project, 'labels'] });
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await axios.delete(`/api/project/${project}/labels/${id}`, {
        headers: { Authorization: `Bearer ${auth.accessToken}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', project, 'labels'] });
    },
  });

  const startEditing = (label: Label) => {
    setEditingId(label.id);
    editForm.reset({
      name: label.name,
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
                    className="flex w-full items-center gap-4"
                    onSubmit={editForm.handleSubmit((data) =>
                      updateMutation.mutate({ ...data, id: label.id })
                    )}
                  >
                    <Input {...editForm.register('name')} className="flex-1" />
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
                  </form>
                ) : (
                  <>
                    <div className="flex items-center space-x-4">
                      <div className="h-6 w-6 rounded" style={{ backgroundColor: label.color }} />
                      <div>
                        <p className="font-medium">{label.name}</p>
                        <p className="text-sm text-gray-500">{label.color}</p>
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
                    className="mt-1"
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
