import {terminal} from 'terminal-kit';
import {FileStructure} from '../builders/helpers/file-structure';
import {sleep} from '../helpers';
import {GetPreset, GetServices, Project} from '../projects';
import TaskManager from '../task-manager/task-manager';
import Feature from './feature';
import {Term, TermBuilder} from './term';

export default class RunFeature extends Feature {
	public readonly featureAlias: string[] = ['r'];
	public readonly featureName: string = 'run';
	public readonly term: Term;
	private readonly services: Project[] = [];

	constructor(private basePath: string, private taskManager: TaskManager) {
		super();
		const services = this.services = GetServices(new FileStructure(basePath));
		const servicesTerms = services.map(s => {
			return TermBuilder.create(s.fullName).withColor('cyan').withAction(async () => this.run(s)).build();
		});
		const presetsTerms = GetPreset(new FileStructure(basePath)).map(s => {
			return TermBuilder.create(s.fullName).withColor('blue').withAction(async () => this.runPreset(s)).build();
		})

		this.term = TermBuilder
			.create(this.featureName)
			.withColor('magenta')
			.withAction(async () => await this.runAll())
			.withInnerTerms([...presetsTerms, ...servicesTerms])
			.build();
	}

	private async run(project: Project, withDependencies: boolean = true) {
		if (!await this.taskManager.run(project)) {
			terminal.yellow(`⚠ ${project.fullName} has already running`).nextLine(1);
		} else {
			terminal.green(`✔ ${project.fullName}`).nextLine(1);
		}
		if (withDependencies && project.additionalInfo.runWith && project.additionalInfo.runWith.length) {
			const services = this.services.filter(s => project.additionalInfo.runWith.indexOf(s.name) !== -1);
			for (let service of services) {
				await this.run(service, withDependencies);
			}
		}
	}

	private async runPreset(project: Project) {
		if (project.additionalInfo.runWith && project.additionalInfo.runWith.length) {
			const services = this.services.filter(s => project.additionalInfo.runWith.indexOf(s.name) !== -1);
			for (let service of services) {
				await this.run(service, true);
				await sleep(50);
			}
		}
	}

	private async runAll() {
		for (let service of this.services) {
			await this.run(service, false);
			await sleep(50);
		}
	}
}
