type Project = {
  id: number;
  title: string;
  createdAt: string;
  role: string;
};

function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="rounded-lg border bg-white hover:border-green-400">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-[#2ecc71]" />
          <div>
            <div className="flex items-center gap-3">
              <span className="font-medium">{project.title}</span>
            </div>
            <p className="text-sm text-gray-600">
              {project.role === 'ADMIN' ? 'Owner' : 'Contributor'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectCard;
