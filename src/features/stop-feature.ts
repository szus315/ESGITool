import {terminal} from 'terminal-kit';
import {FileStructure} from '../builders/helpers/file-structure';
import {sleep} from '../helpers';
import {GetServices, Project} from '../projects';
import TaskManager from '../task-manager/task-manager';
import Feature from './feature';
import {Term, TermBuilder} from './term';

export default class StopFeature extends Feature {
	public readonly featureAlias: string[] = ['s'];
	public readonly featureName: string = 'stop';
	public readonly term: Term;

	constructor(private basePath: string, private taskManager: TaskManager) {
		super();

		const services = GetServices(new FileStructure(basePath));
		const servicesTerms = services.map(s => {
			return TermBuilder.create(s.fullName).withColor('cyan').withAction(async () => this.stop(s)).build();
		});

		this.term = TermBuilder
			.create(this.featureName)
			.withColor('magenta')
			.withAction(async () => await this.stopAll())
			.withInnerTerms(servicesTerms)
			.build();
	}

	private async stop(project: Project) {
		const res = await this.taskManager.stop(project);
		if (res) {
			terminal.green(`${project.fullName} stopped.`).nextLine(1);
		}
	}

	private async stopAll() {
		const tasks = this.taskManager.getAllTasks();
		for (let task of tasks) {
			await task.stop();
			await sleep(50);
			terminal.green(`${task.project.fullName} stopped.`).nextLine(1);
		}
	}
}
