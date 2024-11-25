import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { sprintFormSchema, SprintFormValues } from '@/features/project/sprint/sprintSchema.ts';

interface CreateProjectSprintProps {
  onCreate: (data: SprintFormValues) => void;
}

export function CreateSrpint({ onCreate }: CreateProjectSprintProps) {
  const createForm = useForm<SprintFormValues>({
    resolver: zodResolver(sprintFormSchema),
    defaultValues: {
      name: '',
      dateRange: {
        from: new Date(),
        to: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), // Default to 1 week
      },
    },
  });

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="text-xl">Create Sprint</CardTitle>
        <CardDescription>Add a new sprint to your project.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={createForm.handleSubmit(onCreate)} className="space-y-4">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name
                <Input
                  {...createForm.register('name')}
                  placeholder="Sprint name"
                  className="mt-1"
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
  );
}
