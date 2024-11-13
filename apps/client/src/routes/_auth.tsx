import {
  Link,
  Outlet,
  createFileRoute,
  redirect,
  useParams,
  useRouter,
} from '@tanstack/react-router';
import { ChevronsUpDownIcon, LogOut } from 'lucide-react';
import { Harmony } from '@/components/logo';
import { Topbar } from '@/components/navigation/topbar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/authContext';
import { sleep } from '@/utils/sleep';

export const Route = createFileRoute('/_auth')({
  beforeLoad: ({ context }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: '/login',
      });
    }
  },
  component: AuthLayout,
});

const projectList = [
  {
    role: 'ADMIN',
    project: {
      id: 1,
      title: 'project-01',
      createdAt: '2024-11-12T04:15:54.354Z',
    },
  },
  {
    role: 'GUEST',
    project: {
      id: 2,
      title: 'project-02',
      createdAt: '2024-11-12T04:16:01.855Z',
    },
  },
];

function AuthLayout() {
  const router = useRouter();
  const navigate = Route.useNavigate();
  const auth = useAuth();
  const params = useParams({ strict: false });

  const handleLogout = async () => {
    try {
      await auth.logout();
      await router.invalidate();
      await sleep(1); // 상태 업데이트를 위한 임시 방편
      await navigate({ to: '/' });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div>
      <Topbar
        leftContent={
          <>
            <Link to={params.project === undefined ? '/account' : '/$project'}>
              <Harmony />
            </Link>
            <div className="flex items-center gap-2">
              <h2>{params.project ?? 'My Account'}</h2>
              <DropdownMenu>
                <DropdownMenuTrigger className="h-8">
                  <ChevronsUpDownIcon className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="bg-white">
                  <DropdownMenuItem>
                    <Link to="/account">My Account</Link>
                  </DropdownMenuItem>
                  {projectList.map(({ project }) => (
                    <DropdownMenuItem key={project.id}>
                      <Link to="/$project/board" params={{ project: project.title }}>
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
              <DropdownMenuItem className="justify-between text-red-400" onClick={handleLogout}>
                로그아웃
                <LogOut width={16} />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />
      <Outlet />
    </div>
  );
}
