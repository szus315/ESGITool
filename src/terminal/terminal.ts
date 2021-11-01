import {autoComplete, terminal as term} from 'terminal-kit';
import ExploreFeature from '../features/explore-feature';
import Feature from '../features/feature';
import OpenFeature from '../features/open-feature';
import ParallelBuildFeature from '../features/parallel-build-feature';
import RunFeature from '../features/run-feature';
import SequenceBuildFeature from '../features/sequence-build-feature';
import StopFeature from '../features/stop-feature';
import TaskManager from '../task-manager/task-manager';
import Autocomplete from './autocomplete';
import Autocorrection from './autocorrection';

export default class Terminal {
	private features: Feature[];
	private autocomplete: Autocomplete;
	private autocorrect: Autocorrection;
	private history: string[] = [];

	constructor(private basePath: string) {
		const tm = new TaskManager(basePath);

		this.features = [
			new ExploreFeature(basePath),
			new OpenFeature(basePath),
			new RunFeature(basePath, tm),
			new StopFeature(basePath, tm),
			new ParallelBuildFeature(basePath),
			new SequenceBuildFeature(basePath),
		];
		this.autocomplete = new Autocomplete(this.features.map(f => f.term));
		this.autocorrect = new Autocorrection(this.features.map(f => f.featureName));
	}

	public async start(): Promise<void> {
		// term.red('Red').cyan('Cyan').green('Green').white('White').blue('Blue').blink('Blink');
		function terminate() {
			term.grabInput(false);
			setTimeout(function () {
				process.exit()
			}, 100);
		}

		term.on('key', function (name, matches, data) {
			if (name === 'CTRL_C') {
				terminate();
			}
		});

		let res = 0;
		do {
			res = await this.waitAndExecute();
		} while (res >= 0);
	}

	private async waitAndExecute(): Promise<number> {
		term.gray('Enter:');
		const cmd = await term.inputField({
			autoComplete: (inputString, callback) => {
				let out = this.autocomplete.process(inputString);
				callback(undefined, autoComplete(out, inputString, true));
			},
			autoCompleteHint: true,
			autoCompleteMenu: true,
			history: this.history,
			cancelable: true,
			tokenHook: (token, isEndOfInput, previousTokens, term, config) => {
				const wholeText = [previousTokens, token].join(' ');
				if (wholeText) {
					const currentFeature = this.features.find(f => f.term.isThisTerm(wholeText));
					if (currentFeature) {
						const color = currentFeature.term.getColor(wholeText);
						if (color) {
							config.style = term[color];
							return;
						}
					}
				}
				config.style = term.white;
			}
		}).promise;

		if (cmd) {
			this.history.push(cmd);
			const currentFeature = this.features.find(f => f.term.isThisTerm(cmd));
			if (currentFeature) {
				term.nextLine(1);
				const res = await currentFeature.term.executeAction(cmd) || 0;
				return res;
			} else {
				term.red('\nCommand not recognized.\n');
				return 0;
			}
		} else {
			return 0;
		}
	}

	showDebug() {
		const info = {
			memory: process.memoryUsage(),
			cpu: process.cpuUsage(),
			resources: process.resourceUsage(),
		}
		term(info);
	}
}
