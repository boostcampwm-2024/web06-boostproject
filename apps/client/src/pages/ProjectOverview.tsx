import { useSuspenseQuery } from '@tanstack/react-query';
import { useParams } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { axiosInstance } from '@/lib/axios';

interface GetOverviewResponseDto {
  status: number;
  message: string;
  result: {
    totalTasks: number;
    sections: {
      id: number;
      title: string;
      count: number;
    }[];
  };
}

interface GetWorkloadResponseDto {
  status: number;
  message: string;
  result: {
    totalTasks: number;
    users: {
      id: number;
      username: string;
      profileImage: string;
      count: number;
    }[];
  };
}

// TODO: suspense fallback 만들어야함
// TODO: status overview, burndown chart, ui 작업 필요
function ProjectOverview() {
  const { project } = useParams({ from: '/_auth/$project' });

  const { data: overview } = useSuspenseQuery({
    queryKey: ['project', project, 'overview'],
    queryFn: async () => {
      try {
        const overview = await axiosInstance.get<GetOverviewResponseDto>(
          `/project/${project}/overview`
        );
        return overview.data.result;
      } catch {
        throw new Error('Failed to fetch overview');
      }
    },
  });

  const { data: workload } = useSuspenseQuery({
    queryKey: ['project', project, 'workload'],
    queryFn: async () => {
      try {
        const workload = await axiosInstance.get<GetWorkloadResponseDto>(
          `/project/${project}/workload`
        );
        return workload.data.result;
      } catch {
        throw new Error('Failed to fetch workload');
      }
    },
  });

  return (
    <section className="px-6 py-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="h-[400px] overflow-y-auto bg-white">
          <CardHeader>
            <CardTitle className="text-xl">Status overview</CardTitle>
            <CardDescription className="text-gray-500">
              View your project&apos;s overall progress.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul>
              {overview.sections.map((section) => (
                <li key={section.id} className="flex items-center gap-2">
                  <span>{section.title}</span>
                  <span className="text-gray-500">{section.count}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="h-[400px] overflow-y-auto bg-white">
          <CardHeader>
            <CardTitle className="text-xl">Team Workload</CardTitle>
            <CardDescription className="text-gray-500">
              View your team&apos;s current workload at a glance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Assignee</TableHead>
                  <TableHead>Work distribution</TableHead>
                  <TableHead className="text-right">Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workload.users.map((user) => (
                  <TableRow key={user.id} className="border-0">
                    <TableCell className="flex items-center gap-2">
                      <Avatar className="h-6 w-6 border">
                        <AvatarImage src={user.profileImage} />
                        <AvatarFallback>
                          <div className="h-full w-full bg-gradient-to-br from-purple-600 via-fuchsia-500 to-pink-500" />
                        </AvatarFallback>
                      </Avatar>
                      {user.username}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress
                          className="flex-1"
                          value={
                            workload.totalTasks > 0 ? (user.count / workload.totalTasks) * 100 : 0
                          }
                        />
                        <span className="w-10">
                          {workload.totalTasks > 0
                            ? ((user.count / workload.totalTasks) * 100).toFixed(0)
                            : 0}
                          %
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{user.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="h-[400px] bg-white">
          <CardHeader>
            <CardTitle className="text-xl">Burndown chart</CardTitle>
            <CardDescription className="text-gray-500">
              Track your project&apos;s progress over time
            </CardDescription>
          </CardHeader>
          <CardContent>번다운차트</CardContent>
        </Card>
      </div>
    </section>
  );
}

export default ProjectOverview;
