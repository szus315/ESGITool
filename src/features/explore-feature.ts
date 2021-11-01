import child_process, {execFile} from 'child_process';
import path from 'path';
import {terminal} from 'terminal-kit';
import {FileStructure} from '../builders/helpers/file-structure';
import {GetServices, Project} from '../projects';
import Feature from './feature';
import {Term, TermBuilder} from './term';

export default class ExploreFeature extends Feature {
	public readonly term: Term;
	public readonly featureName: string = 'explore';
	public readonly featureAlias: string[] = ['e'];

	private async open(project: Project) {
		if (project.getSlnPath()) {
			try {
				const sln = project.getSlnPath();
				const p = path.resolve(sln,'../');
				const cmd = `start explorer ${p}`;
				await child_process.execSync(cmd);
			} catch (e) {
				terminal.red('🙁 Fail to explore a ' + project.fullName);
			}
		}
	}

	constructor(private basePath: string) {
		super();
		const services = GetServices(new FileStructure(basePath));
		const servicesTerms = services.map(s => {
			return TermBuilder.create(s.fullName).withColor('cyan').withAction(async () => this.open(s)).build();
		});

		this.term = TermBuilder
			.create(this.featureName)
			.withColor('magenta')
			.withAction(async () => this.notImplementedAction())
			.withInnerTerms(servicesTerms)
			.build();
	}
}
