import { AlertTriangle } from 'lucide-react';
import { createFileRoute } from '@tanstack/react-router';
import { GetProjectsResponseDTO } from '@/types/project';
import AccountOverview from '@/pages/AccountOverview';
import { axiosInstance } from '@/lib/axios.ts';
import { Card, CardContent } from '@/components/ui/card.tsx';
import { Button } from '@/components/ui/button.tsx';

export const Route = createFileRoute('/_auth/account/')({
  loader: ({ context: { queryClient } }) => {
    queryClient.ensureQueryData({
      queryKey: ['projects'],
      queryFn: async () => {
        const projects = await axiosInstance.get<GetProjectsResponseDTO>('/projects');
        return projects.data.result;
      },
    });
  },
  errorComponent: ({ error, reset }) => (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500" />
          <h2 className="mt-6 text-2xl font-semibold text-gray-900">Failed to load projects</h2>
          <p className="mt-2 text-gray-600">
            {error.message || 'An error occurred while loading the projects'}
          </p>
          <div className="mt-8 space-x-4">
            <Button variant="outline" onClick={() => window.history.back()}>
              Go Back
            </Button>
            <Button onClick={reset}>Try Again</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  ),
  component: AccountOverview,
});
