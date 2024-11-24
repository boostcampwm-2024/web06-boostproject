import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import axios from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from '@tanstack/react-router';
import { Pencil, Plus, X } from 'lucide-react';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/authContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DateRangePicker } from '@/components/ui/date-range-picker';

interface Sprint {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
}

const formSchema = z.object({
  name: z.string().min(1, 'Sprint name is required'),
  dateRange: z
    .object({
      from: z.date(),
      to: z.date(),
    })
    .refine((data) => data.from <= data.to, {
      message: 'End date must be after start date',
    }),
});

type FormValues = z.infer<typeof formSchema>;

interface SprintPayload {
  name: string;
  startDate: string;
  endDate: string;
}

const getSprintStatus = (startDate: string, endDate: string) => {
  const now = new Date().toISOString().split('T')[0];
  if (now < startDate) return 'PLANNED';
  if (now > endDate) return 'COMPLETED';
  return 'CURRENT';
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PLANNED':
      return 'bg-gray-100 text-gray-800';
    case 'CURRENT':
      return 'bg-blue-100 text-blue-800';
    case 'COMPLETED':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function ProjectSprintsSettings() {
  const auth = useAuth();
  const { project } = useParams({ from: '/_auth/$project/settings' });
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<number | null>(null);

  const sprints: Sprint[] = [
    { id: 1, name: 'Sprint 4', startDate: '2024-11-14', endDate: '2024-11-22' },
    { id: 2, name: 'Sprint 5', startDate: '2024-11-23', endDate: '2024-11-30' },
    { id: 3, name: 'Sprint 6', startDate: '2024-12-01', endDate: '2024-12-05' },
    { id: 4, name: 'Sprint 7', startDate: '2024-12-06', endDate: '2024-12-10' },
    { id: 5, name: 'Sprint 8', startDate: '2024-12-11', endDate: '2024-12-15' },
  ];

  const createForm = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      dateRange: {
        from: new Date(),
        to: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
      },
    },
  });

  const editForm = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const formatFormDataForApi = (data: FormValues): SprintPayload => ({
    name: data.name,
    startDate: format(data.dateRange.from, 'yyyy-MM-dd'),
    endDate: format(data.dateRange.to, 'yyyy-MM-dd'),
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const formattedData = formatFormDataForApi(data);
      await axios.post(`/api/project/${project}/sprints`, formattedData, {
        headers: { Authorization: `Bearer ${auth.accessToken}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', project, 'sprints'] });
      createForm.reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: FormValues }) => {
      const formattedData = formatFormDataForApi(data);
      await axios.put(`/api/project/${project}/sprints/${id}`, formattedData, {
        headers: { Authorization: `Bearer ${auth.accessToken}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', project, 'sprints'] });
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await axios.delete(`/api/project/${project}/sprints/${id}`, {
        headers: { Authorization: `Bearer ${auth.accessToken}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', project, 'sprints'] });
    },
  });

  const startEditing = (sprint: Sprint) => {
    setEditingId(sprint.id);
    editForm.reset({
      name: sprint.name,
      dateRange: {
        from: new Date(sprint.startDate),
        to: new Date(sprint.endDate),
      },
    });
  };

  return (
    <div className="space-y-6">
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
                    onSubmit={editForm.handleSubmit((data) =>
                      updateMutation.mutate({ id: sprint.id, data })
                    )}
                  >
                    <div className="w-full">
                      <Input {...editForm.register('name')} className="flex-1" />
                    </div>
                    <div className="w-full">
                      <Controller
                        control={editForm.control}
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
                        onClick={() => deleteMutation.mutate(sprint.id)}
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
          <CardTitle className="text-xl">Create Sprint</CardTitle>
          <CardDescription>Add a new sprint to your project.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={createForm.handleSubmit((data) => createMutation.mutate(data))}
            className="space-y-4"
          >
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Name
                  <Input
                    {...createForm.register('name')}
                    placeholder="Sprint name"
                    className="mt-1"
                    name="name"
                    id="name"
                  />
                </label>
                {createForm.formState.errors.name && (
                  <p className="mt-1 text-sm text-red-500">
                    {createForm.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Duration
                  <div className="mt-1">
                    <Controller
                      control={createForm.control}
                      name="dateRange"
                      render={({ field }) => (
                        <DateRangePicker date={field.value} onChange={field.onChange} />
                      )}
                    />
                    {createForm.formState.errors.dateRange && (
                      <p className="mt-1 text-sm text-red-500">
                        {createForm.formState.errors.dateRange.message}
                      </p>
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
    </div>
  );
}
