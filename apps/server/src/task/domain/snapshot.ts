import { Task } from './task.entity';

export class Snapshot {
  constructor(project) {
    this.version = new Date();
    this.project = project;
  }

  version: Date;

  project: {
    id: number;
    name: string;
    tasks: {
      id: number;
      title: string;
      description: string;
      sectionName: string;
      position: string;
    }[];
  }[];

  update(task: Task) {
    const section = this.project.find((s) => s.id === task.section.id);
    if (!section) {
      return;
    }

    const target = section.tasks.find((t) => t.id === task.id);
    if (!target) {
      return;
    }

    target.title = task.title;
    target.description = task.description;
    target.sectionName = task.section.name;
    target.position = task.position;
  }
}
