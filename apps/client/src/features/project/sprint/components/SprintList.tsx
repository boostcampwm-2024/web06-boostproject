import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { sprintFormSchema, SprintFormValues } from '@/features/project/sprint/sprintSchema.ts';
import { Sprint } from '@/details/types.tsx';
import { getStatusColor } from '@/features/project/sprint/getStatusColor.ts';
import { getSprintStatus } from '@/features/project/sprint/getSprintStatus.ts';

interface ProjectSprintManagerProps {
  sprints: Sprint[];
  onUpdate: (sprintId: number, data: SprintFormValues) => void;
  onDelete: (sprintId: number) => void;
}

export function SprintList({ sprints, onUpdate, onDelete }: ProjectSprintManagerProps) {
  const [editingId, setEditingId] = useState<number | null>(null);

  const editForm = useForm<SprintFormValues>({
    resolver: zodResolver(sprintFormSchema),
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
                  onSubmit={editForm.handleSubmit((data) => {
                    onUpdate(sprint.id, data);
                    setEditingId(null);
                  })}
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
        </div>
      </CardContent>
    </Card>
  );
}
