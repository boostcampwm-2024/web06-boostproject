import { Task } from '../domain/task.entity';

export class TaskResponse {
<<<<<<< HEAD
	constructor(task: Task) {
		this.id = task.id;
		this.title = task.title;
		this.description = task.description;
		this.sectionName = task.section.name;
		this.position = task.position;
	}

	id: number;

	title: string;

	description: string;

	sectionName: string;

	position: string;
=======
  constructor(task: Task) {
    this.id = task.id;
    this.title = task.title;
    this.description = task.description;
    this.sectionName = task.section.name;
    this.position = task.position;
  }

  id: number;

  title: string;

  description: string;

  sectionName: string;

  position: string;
>>>>>>> 7679844a70608707288d38f187371a9580eafb79
}
