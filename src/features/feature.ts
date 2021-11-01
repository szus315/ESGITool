import {terminal} from 'terminal-kit';
import {Term} from './term';

export default abstract class Feature {
	public readonly abstract featureName: string;
	public readonly abstract featureAlias: string[];
	public readonly abstract term: Term;

	protected notImplementedAction(): void {
		terminal.yellow('\n⚠ additional term required\n');
	}
}
