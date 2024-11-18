import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CreateProjectRequestDTO } from '@/types/project';

const formSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required.')
    .regex(/^[a-zA-Z0-9 ]*$/, 'Only English letters and numbers are allowed.'),
});

interface CreateProjectDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (data: CreateProjectRequestDTO) => void;
  isPending: boolean;
}

function CreateProjectDialog({
  isOpen,
  onOpenChange,
  onSubmit,
  isPending,
}: CreateProjectDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateProjectRequestDTO>({
    resolver: zodResolver(formSchema),
  });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Create a New Project</DialogTitle>
          <DialogDescription>Enter a title to create a new project.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-2">
            <label htmlFor="title">
              <Input id="title" type="text" placeholder="Project Title" {...register('title')} />
              {errors.title && <span className="text-sm text-red-500">{errors.title.message}</span>}
            </label>
            <Button
              type="submit"
              className="bg-black text-white hover:bg-black/80"
              disabled={isPending}
            >
              {isPending ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CreateProjectDialog;
