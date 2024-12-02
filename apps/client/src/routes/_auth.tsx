import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { Link, Outlet, createFileRoute, redirect, useParams } from '@tanstack/react-router';
import { AlertTriangle, ChevronsUpDownIcon, LogOut, UserPen } from 'lucide-react';
import { SlashIcon } from '@radix-ui/react-icons';
import { ChangeEvent, useState } from 'react';
import axios from 'axios';
import { Harmony } from '@/components/logo';
import Header from '@/components/Header';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { axiosInstance } from '@/lib/axios.ts';
import { useAuth } from '@/features/auth/useAuth.ts';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/lib/useToast';
import { Card, CardContent } from '@/components/ui/card.tsx';

type Project = {
  id: number;
  title: string;
  createdAt: string;
  role: string;
};

type ProjectResponse = {
  status: number;
  message: string;
  result: Project[];
};

export const Route = createFileRoute('/_auth')({
  beforeLoad: ({ context: { auth } }) => {
    if (!auth.isAuthenticated) {
      throw redirect({
        to: '/login',
      });
    }
  },
  loader: ({ context: { queryClient } }) => {
    queryClient.ensureQueryData({
      queryKey: ['projects'],
      queryFn: async () => {
        try {
          const projects = await axiosInstance.get<ProjectResponse>('/projects');
          return projects.data.result;
        } catch {
          throw new Error('Failed to fetch projects');
        }
      },
    });
  },
  errorComponent: () => (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md border bg-white">
        <CardContent className="space-y-6 p-6 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500" />
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-gray-900">Failed to load</h2>
            <p className="text-sm text-gray-500">Sorry, an unexpected error occurred.</p>
          </div>
          <div className="flex justify-center space-x-3">
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="hover:bg-[#f2f2f2] hover:text-black"
            >
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  ),
  notFoundComponent: () => (
    <div className="flex min-h-[calc(100vh-100px)] items-center justify-center p-4">
      <Card className="w-full max-w-md border bg-white">
        <CardContent className="space-y-6 p-6 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500" />
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-gray-900">Page not found</h2>
            <p className="text-sm text-gray-500">Sorry, the page could not be found.</p>
          </div>
          <div className="flex justify-center space-x-3">
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="hover:bg-[#f2f2f2] hover:text-black"
            >
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  ),
  component: AuthLayout,
});

function AuthLayout() {
  const navigate = Route.useNavigate();
  const params = useParams({ strict: false });
  const { data: projects } = useSuspenseQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      try {
        const projects = await axiosInstance.get<ProjectResponse>('/projects');
        return projects.data.result;
      } catch {
        throw new Error('Failed to fetch projects');
      }
    },
  });

  const { logoutMutation, profileImage, updateProfileImage } = useAuth();

  const { mutateAsync: logout } = logoutMutation;

  const handleLogout = async () => {
    await logout();

    setTimeout(() => {
      navigate({ to: '/login' });
    }, 100);
  };

  const currentProject = projects.find((project) => project.id === Number(params.project));

  const toast = useToast();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>();
  const [selectedFile, setSelectedFile] = useState<File>();
  const { mutate: uploadProfileImage, isPending } = useMutation({
    mutationFn: async (selectedFile: File) => {
      // Fetch presigned URL
      const { data: s3UrlResponse } = await axiosInstance.post('/image/presigned-url', {
        fileName: selectedFile.name,
      });
      if (s3UrlResponse.status !== 200) {
        throw new Error('Failed to fetch presigned URL.');
      }

      const {
        result: { presignedUrl, key },
      } = s3UrlResponse;

      // Upload to S3
      const putResponse = await axios.put(presignedUrl, selectedFile, {
        headers: {
          'Content-Type': selectedFile.type,
        },
      });
      if (putResponse.status !== 200) {
        throw new Error('Failed to upload image.');
      }

      // Fetch access URL
      const { data: imageUrlResponse } = await axiosInstance.get(`/image/access-url/${key}`);
      if (imageUrlResponse.status !== 200) {
        throw new Error('Failed to fetch image URL.');
      }

      const {
        result: { accessUrl },
      } = imageUrlResponse;

      return accessUrl;
    },
    onSuccess: (accessUrl) => {
      updateProfileImage(accessUrl);

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(undefined);
      setSelectedFile(undefined);
      setIsProfileOpen(false);
      toast.success('Image uploaded successfully.');
    },
    onError: () => {
      toast.error('Failed to upload image.');
    },
  });

  const handleProfileEditButtonClick = () => {
    setIsProfileOpen(true);
  };

  const handleImageUploadChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) {
      return;
    }

    const file = event.target.files[0];
    setSelectedFile(file);

    const imageUrl = URL.createObjectURL(file);
    setPreviewUrl(imageUrl);
  };

  const handleImageUploadButtonClick = () => {
    if (!selectedFile) {
      toast.error('Please select an image.');
      return;
    }

    uploadProfileImage(selectedFile);
  };

  return (
    <div>
      <Header>
        <Header.Left>
          <Link to={params.project === undefined ? '/account' : '/$project'}>
            <Harmony />
          </Link>
          <SlashIcon className="h-5 text-gray-300" />
          <div className="flex items-center gap-2">
            <h2>{(params.project && currentProject?.title) ?? 'My Account'}</h2>
            <DropdownMenu>
              <DropdownMenuTrigger className="h-8">
                <ChevronsUpDownIcon className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="bg-white">
                <DropdownMenuItem
                  asChild
                  className="hover:cursor-pointer focus:bg-[#f2f2f2] focus:text-black"
                >
                  <Link to="/account">My Account</Link>
                </DropdownMenuItem>
                {projects.map((project) => (
                  <DropdownMenuItem
                    key={project.id}
                    asChild
                    className="hover:cursor-pointer focus:bg-[#f2f2f2] focus:text-black"
                  >
                    <Link to="/$project/board" params={{ project: String(project.id) }}>
                      {project.title}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </Header.Left>
        <Header.Right>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar className="h-8 w-8 border">
                <AvatarImage src={profileImage} className="object-cover" alt="Avatar" />
                <AvatarFallback>
                  <div className="h-full w-full bg-gradient-to-br from-purple-600 via-fuchsia-500 to-pink-500" />
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 bg-white">
              <DropdownMenuItem
                className="justify-between hover:cursor-pointer focus:bg-[#f2f2f2] focus:text-black"
                onClick={handleProfileEditButtonClick}
              >
                Edit profile
                <UserPen width={16} />
              </DropdownMenuItem>
              <DropdownMenuItem
                className="justify-between text-red-400 hover:cursor-pointer focus:bg-[#f2f2f2] focus:text-red-400"
                onClick={handleLogout}
              >
                Log out
                <LogOut width={16} />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Header.Right>
      </Header>
      <Dialog
        open={isProfileOpen}
        onOpenChange={(isProfileOpen) => {
          if (!isProfileOpen) {
            if (previewUrl) {
              URL.revokeObjectURL(previewUrl);
            }
            setPreviewUrl(undefined);
            setSelectedFile(undefined);
          }
          setIsProfileOpen(isProfileOpen);
        }}
      >
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Avatar</DialogTitle>
            <DialogDescription className="text-gray-500">
              This is your avatar.
              <br />
              Click on the avatar to upload a custom one from your files.
            </DialogDescription>
          </DialogHeader>
          <div className="my-2 flex justify-center">
            <label
              htmlFor="avatar-upload"
              className="flex h-28 w-28 cursor-pointer items-center justify-center overflow-hidden rounded-full shadow-lg"
            >
              <Avatar className="h-full w-full">
                <AvatarImage
                  src={previewUrl || profileImage}
                  className="object-cover"
                  alt="Avatar"
                />
                <AvatarFallback>
                  <div className="h-full w-full bg-gradient-to-br from-purple-600 via-fuchsia-500 to-pink-500" />
                </AvatarFallback>
              </Avatar>
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUploadChange}
              disabled={isPending}
            />
          </div>
          <DialogFooter>
            <Button
              className="bg-black hover:bg-black/80"
              onClick={handleImageUploadButtonClick}
              disabled={isPending}
            >
              {isPending ? 'Uploading...' : 'Save changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Outlet />
    </div>
  );
}
