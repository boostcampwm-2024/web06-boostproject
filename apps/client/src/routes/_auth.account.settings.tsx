import { createFileRoute } from '@tanstack/react-router';
import { AlertTriangle } from 'lucide-react';
import AccountSettings from '@/pages/AccountSettings';
import { GetProjectInvitationsResponseDTO } from '@/types/project';
import { axiosInstance } from '@/lib/axios.ts';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/_auth/account/settings')({
  loader: ({ context: { queryClient } }) => {
    queryClient.ensureQueryData({
      queryKey: ['project', 'invitations'],
      queryFn: async () => {
        try {
          const invitations =
            await axiosInstance.get<GetProjectInvitationsResponseDTO>('/project/invitations');
          return invitations.data.result;
        } catch {
          throw new Error('Failed to fetch invitations');
        }
      },
    });
  },
  errorComponent: ({ error, reset }) => (
    <div className="flex min-h-[calc(100vh-100px)] items-center justify-center p-4">
      <Card className="w-full max-w-md border bg-white">
        <CardContent className="space-y-6 p-6 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500" />
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-gray-900">Failed to load settings</h2>
            <p className="text-sm text-gray-500">
              {error.message || 'An error occurred while loading the settings. Please try again.'}
            </p>
          </div>
          <div className="flex justify-center space-x-3">
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="hover:bg-[#f2f2f2] hover:text-black"
            >
              Go Back
            </Button>
            <Button onClick={reset} className="bg-black hover:bg-black/80">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  ),
  component: AccountSettings,
});
