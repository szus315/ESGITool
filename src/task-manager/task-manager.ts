import {terminal} from 'terminal-kit';
import {Project} from '../projects';
import ServiceTask from './service-task';

export default class TaskManager {
	protected readonly __tasks: Map<string, ServiceTask> = new Map<string, ServiceTask>();

	public constructor(private basePath: string) {
	}

	public async run(project: Project): Promise<boolean> {
		const task = new ServiceTask(project, (project) => this.stop(project));
		if (!this.isRunning(project)) {
			this.__tasks.set(this.getKey(project), task);
			task.start();
			return true;
		} else {
			return false;
		}
	}

	public async stop(project: Project): Promise<boolean> {
		const task = this.findTask(project);
		if (task) {
			await task.stop();
			this.__tasks.delete(this.getKey(project));
			return true;
		} else {
			return false;
		}
	}

	public isRunning(project: Project): boolean {
		const task = this.findTask(project);
		return task && task.alive;
	}

	public getAllTasks(): ServiceTask[] {
		return Array.from(this.__tasks.values())
	}

	private findTask(project: Project): ServiceTask {
		return this.__tasks.get(this.getKey(project));
	}

	private getKey(project: Project): string {
		return project.type + project.additionalInfo.envType + project.name;
	}

}
