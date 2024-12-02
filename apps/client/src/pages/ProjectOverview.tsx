import { useSuspenseQueries } from '@tanstack/react-query';
import { useParams } from '@tanstack/react-router';
import { Bar, BarChart, Cell, XAxis, Label, Pie, PieChart } from 'recharts';
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
import { ChartConfig, ChartContainer } from '@/components/ui/chart';

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

interface GetPriorityResponseDto {
  status: number;
  message: string;
  result: {
    priority: string;
    count: number;
  }[];
}

const priorityConfig = {
  None: { label: 'None', color: '#DEE1E6' },
  Lowest: { label: 'Lowest', color: '#4ADE80' },
  Low: { label: 'Low', color: '#22C55E' },
  Medium: { label: 'Medium', color: '#EAB308' },
  High: { label: 'High', color: '#F97316' },
  Highest: { label: 'Highest', color: '#EF4444' },
} satisfies ChartConfig;

const overviewConfig = {
  'To Do': { label: 'To Do', color: '#DEE1E6' },
  'In Progress': { label: 'In Progress', color: '#279AFE' },
  Done: { label: 'Done', color: '#00B67A' },
} satisfies ChartConfig;

function ProjectOverview() {
  const { project } = useParams({ from: '/_auth/$project' });

  const [{ data: overview }, { data: workload }, { data: priority }] = useSuspenseQueries({
    queries: [
      {
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
      },
      {
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
      },
      {
        queryKey: ['project', project, 'priority'],
        queryFn: async () => {
          try {
            const priority = await axiosInstance.get<GetPriorityResponseDto>(
              `/project/${project}/priority`
            );
            return priority.data.result;
          } catch {
            throw new Error('Failed to fetch priority');
          }
        },
      },
    ],
  });

  const overviewData = overview.sections.map((section) => ({
    name: section.title,
    value: section.count,
  }));

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
            <ChartContainer config={overviewConfig} className="h-[280px] w-full">
              <PieChart>
                <Pie
                  data={overviewData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={50}
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={false}
                >
                  {overviewData.map((item) => (
                    <Cell
                      key={item.name}
                      fill={overviewConfig[item.name as keyof typeof overviewConfig].color}
                    />
                  ))}
                  {/* eslint-disable react/no-unstable-nested-components */}
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-black text-3xl font-bold"
                            >
                              {Math.round((overviewData[2].value / overview.totalTasks) * 100)}%
                            </tspan>
                            <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24}>
                              Done
                            </tspan>
                          </text>
                        );
                      }
                      return null;
                    }}
                  />
                  {/* eslint-disable react/no-unstable-nested-components */}
                </Pie>
              </PieChart>
            </ChartContainer>
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
            <CardTitle className="text-xl">Priority breakdown</CardTitle>
            <CardDescription className="text-gray-500">
              View the priority of items within your project.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={priorityConfig} className="max-h-[300px] min-h-[200px] w-full">
              <BarChart accessibilityLayer data={priority}>
                <XAxis dataKey="priority" tickLine={false} tickMargin={10} axisLine={false} />
                <Bar dataKey="count" radius={4}>
                  {priority.map((item) => (
                    <Cell
                      key={item.priority}
                      fill={priorityConfig[item.priority as keyof typeof priorityConfig].color}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

export default ProjectOverview;
