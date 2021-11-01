import {terminal} from 'terminal-kit';
import SequenceBuilder from '../builders/sequence-builder';
import Feature from './feature';
import {Term, TermBuilder} from './term';

export default class SequenceBuildFeature extends Feature {
	public readonly term: Term;
	public readonly featureName: string = 'build';
	public readonly featureAlias: string[] = ['b'];

	private async buildLibs() {
		const builder = new SequenceBuilder(this.basePath);
		await builder.buildLibs();
	}

	private async buildContracts() {
		const builder = new SequenceBuilder(this.basePath);
		await builder.buildContracts();
	}

	private async buildServices() {
		const builder = new SequenceBuilder(this.basePath);
		await builder.buildServices();
	}

	private async buildAll() {
		const timer = Date.now();
		await this.buildLibs();
		await this.buildContracts();
		await this.buildServices();
		terminal.nextLine(1).green('Total time elapsed: ').cyan((Date.now() - timer) / 1000).green(' sec.').nextLine(1);
	}

	constructor(private basePath: string) {
		super();
		const libsTerm = TermBuilder
			.create('libs')
			.withColor('cyan')
			.withAction(async () => await this.buildLibs())
			.build();
		const contractTerm = TermBuilder
			.create('contracts')
			.withColor('cyan')
			.withAction(async () => await this.buildContracts())
			.build();
		const serviceTerm = TermBuilder
			.create('services')
			.withColor('cyan')
			.withAction(async () => await this.buildServices())
			.build();

		this.term = TermBuilder
			.create(this.featureName)
			.withColor('magenta')
			.withInnerTerms([libsTerm, contractTerm, serviceTerm])
			.withAction(async () => await this.buildAll())
			.build();
	}
}
