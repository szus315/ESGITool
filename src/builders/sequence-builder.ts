import {terminal} from 'terminal-kit';
import DotNetBuilder from './builder';
import {FileStructure} from './helpers/file-structure';
import {GetLibs, GetServices} from '../projects';

export default class SequenceBuilder {
	constructor(private _basePath: string) {
	}

	public async buildLibs() {
		terminal.hideCursor(true);
		const timer = Date.now();
		const fStruct = new FileStructure(this._basePath);
		const libs = GetLibs(fStruct);

		const progressBar = terminal.progressBar({
			width: 90,
			title: 'Build libs: ',
			percent: true,
			eta: true,
			items: libs.length,
		});
		let countDown = 0;

		for (let project of libs) {
			const item = 'Build ' + project.additionalInfo.envType + '.' + project.name;
			progressBar.startItem(item);
			const task = DotNetBuilder.build(project).catch(err => this.stopBuild(err));
			await task;

			countDown++;
			progressBar.itemDone(item);
			progressBar.update(countDown / libs.length)
		}

		progressBar.stop();

		terminal.nextLine(1).green('Build of libs completed by ').cyan((Date.now() - timer) / 1000).green(' sec.').nextLine(1);
		terminal.hideCursor(false);
	}

	public async buildContracts() {
		const timer = Date.now();
		terminal.hideCursor(true);

		const fStruct = new FileStructure(this._basePath);
		const services = GetServices(fStruct);

		const progressBar = terminal.progressBar({
			width: 90,
			title: 'Build contracts: ',
			percent: true,
			eta: true,
			items: services.length,
		});

		let countDown = 0;

		for (let project of services) {
			const item = 'Build ' + project.additionalInfo.envType + '.' + project.name;
			progressBar.startItem(item);

			const task = DotNetBuilder.buildContract(project).catch(err => this.stopBuild(err));
			await task;

			countDown++;
			progressBar.itemDone(item);
			progressBar.update(countDown / services.length)
		}

		progressBar.stop();
		terminal.nextLine(1).green('Build of contracts completed by ').cyan((Date.now() - timer) / 1000).green(' sec.').nextLine(1);
		terminal.hideCursor(false);
	}

	public async buildServices() {
		const timer = Date.now();
		terminal.hideCursor(true);

		const fStruct = new FileStructure(this._basePath);
		const services = GetServices(fStruct);

		const progressBar = terminal.progressBar({
			width: 90,
			title: 'Build services: ',
			percent: true,
			eta: true,
			items: services.length,

		});

		let countDown = 0;

		for (let project of services) {
			const item = 'Build ' + project.additionalInfo.envType + '.' + project.name;
			progressBar.startItem(item);

			const task = DotNetBuilder.build(project).catch(err => this.stopBuild(err));
			await task;

			countDown++;
			progressBar.itemDone(item);
			progressBar.update(countDown / services.length)
		}

		progressBar.stop();
		terminal.nextLine(1).green('Build of services completed by ').cyan((Date.now() - timer) / 1000).green(' sec.').nextLine(1);
		terminal.hideCursor(false);
	}


	private stopBuild(err) {
		console.error(err);
		console.debug('Build stopped');
	}
}
