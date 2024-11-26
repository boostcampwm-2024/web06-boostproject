import { useSuspenseQuery } from '@tanstack/react-query';
import { Link, Outlet, createFileRoute, redirect, useParams } from '@tanstack/react-router';
import { ChevronsUpDownIcon, LogOut } from 'lucide-react';
import { SlashIcon } from '@radix-ui/react-icons';
import { Harmony } from '@/components/logo';
import { Topbar } from '@/components/navigation/topbar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { axiosInstance } from '@/lib/axios.ts';
import { useAuth } from '@/features/auth/useAuth.ts';
import { Toaster } from '@/components/ui/sonner.tsx';

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
  errorComponent: () => <div>Failed to load projects</div>,
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

  const { logoutMutation } = useAuth();
  const { mutateAsync: logout } = logoutMutation;

  const handleLogout = async () => {
    await logout();

    setTimeout(() => {
      navigate({ to: '/login' });
    }, 100);
  };

  const currentProject = projects.find((project) => project.id === Number(params.project));

  return (
    <div>
      <Topbar
        leftContent={
          <>
            <Link to={params.project === undefined ? '/account' : '/$project'}>
              <Harmony />
            </Link>
            <SlashIcon />
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
          </>
        }
        rightContent={
          <DropdownMenu>
            <DropdownMenuTrigger>
              {/* 프로필 이미지 */}
              <div className="h-8 w-8 rounded-full bg-[#333333]" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 bg-white">
              <DropdownMenuItem
                className="justify-between text-red-400 hover:cursor-pointer focus:bg-[#f2f2f2] focus:text-red-400"
                onClick={handleLogout}
              >
                로그아웃
                <LogOut width={16} />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />
      <Outlet />
      <Toaster position="bottom-left" />
    </div>
  );
}
