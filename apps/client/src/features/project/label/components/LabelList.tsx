import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Pencil, X, Shuffle } from 'lucide-react';
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
import { Label } from '@/details/types.tsx';
import { generateRandomColor } from '@/features/project/label/generateRandomColor.ts';
import { labelFormSchema, LabelFormValues } from '@/features/project/label/labelSchema.ts';

interface LabelListProps {
  labels: Label[];
  onUpdate: (labelId: number, data: Partial<Label>) => void;
  onDelete: (labelId: number) => void;
}

export function LabelList({ labels, onUpdate, onDelete }: LabelListProps) {
  const [editingId, setEditingId] = useState<number | null>(null);

  const editForm = useForm<LabelFormValues>({
    resolver: zodResolver(labelFormSchema),
  });

  const startEditing = (label: Label) => {
    setEditingId(label.id);
    editForm.reset({
      name: label.name,
      description: label.description,
      color: label.color,
    });
  };

  const handleRandomColor = () => {
    editForm.setValue('color', generateRandomColor(), { shouldValidate: true });
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
                  onSubmit={editForm.handleSubmit((data) => {
                    onUpdate(label.id, data);
                    setEditingId(null);
                  })}
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
                        onClick={handleRandomColor}
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
