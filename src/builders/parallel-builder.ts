import * as os from 'os';
import {terminal} from 'terminal-kit';
import DotNetBuilder from './builder';
import DependencyInfo from './helpers/dependency-info';
import {FileStructure} from './helpers/file-structure';
import Logger from '../terminal/logger';
import {GetLibs, GetServices, Project} from '../projects';

interface IDependencyInfo {
	project: Project;
	dependencies: Project[];
}

interface IBuildStatusInfo {
	project: Project;
	dependencies: IBuildStatusInfo[];
	isCompleted: boolean;
}

type BuildListener = (project: Project) => void;

export default class ParallelBuilder {
	constructor(private _basePath: string, private showProgress = true) {
	}

	public async buildLibs(onBuildCallback?: BuildListener) {
		terminal.hideCursor(true);
		const timer = Date.now();
		const fStruct = new FileStructure(this._basePath);
		const libs = GetLibs(fStruct);

		const dependenciesProgressBar = terminal.progressBar({
			width: 90,
			title: '\nDefine libs dependencies: ',
			percent: true,
			eta: true,
		});

		let countDown = 0;
		const libsWithDependencies = await this.collectLibsDependencies(libs, lib => {
			countDown++;
			dependenciesProgressBar.update(countDown / libs.length);
		});
		dependenciesProgressBar.stop();
		terminal.nextLine(1);

		const buildProgressBar = terminal.progressBar({
			width: 90,
			title: '\nBuild libs: ',
			percent: true,
			eta: true,
		});

		countDown = 0;
		await this._buildLibs(libsWithDependencies, lib => {
			onBuildCallback && onBuildCallback(lib);
			countDown++;
			buildProgressBar.update(countDown/libs.length)
		});

		buildProgressBar.stop();

		terminal.nextLine(2).green('Build of libs completed by ').cyan((Date.now() - timer) / 1000).green(' sec.').nextLine(1);
		terminal.hideCursor(false);
	}

	public async buildContracts(onBuildCallback?: BuildListener) {
		const timer = Date.now();
		terminal.hideCursor(true);

		const coresCount = os.cpus().length;
		const fStruct = new FileStructure(this._basePath);
		const services = GetServices(fStruct);

		const progressBar = terminal.progressBar({
			width: 90,
			title: '\nBuild contracts: ',
			percent: true,
			eta: true,
		});

		let countDown = 0;
		await this._buildContracts(services, coresCount, lib => {
			onBuildCallback && onBuildCallback(lib);
			countDown++;
			progressBar.update(countDown/services.length)
		});

		progressBar.stop();
		terminal.nextLine(2).green('Build of contracts completed by ').cyan((Date.now() - timer) / 1000).green(' sec.').nextLine(1);
		terminal.hideCursor(false);
	}

	public async buildServices(onBuildCallback?: BuildListener) {
		const timer = Date.now();
		terminal.hideCursor(true);

		const coresCount = os.cpus().length;
		const fStruct = new FileStructure(this._basePath);
		const services = GetServices(fStruct);

		const progressBar = terminal.progressBar({
			width: 90,
			title: '\nBuild services: ',
			percent: true,
			eta: true,
		});

		let countDown = 0;
		await this._buildServices(services, coresCount, lib => {
			onBuildCallback && onBuildCallback(lib);
			countDown++;
			progressBar.update(countDown/services.length)
		});

		progressBar.stop();
		terminal.nextLine(2).green('Build of contracts completed by ').cyan((Date.now() - timer) / 1000).green(' sec.').nextLine(1);
		terminal.hideCursor(false);
	}

	private async collectLibsDependencies(libs: Project[], progressCallback: (project: Project) => void): Promise<IDependencyInfo[]> {
		const out = [];
		for (let lib of libs) {
			const dependencyInfo = {
				project: lib,
				dependencies: [],
			} as IDependencyInfo;

			const dependencies = await DependencyInfo.getDependencies(lib);
			progressCallback(lib);
			if (dependencies && dependencies.length) {
				dependencyInfo.dependencies = dependencies.map(d => libs.find(l => l.name.toLowerCase().endsWith(d.toLowerCase())));
			}
			out.push(dependencyInfo);
		}

		return out;
	}

	private getBuildLayer(projects: IBuildStatusInfo[]): IBuildStatusInfo[] {
		const notCompleted = projects.filter(p => !p.isCompleted);
		const out = notCompleted.filter(p => !p.dependencies.filter(d => !d.isCompleted).length);
		return out;
	}

	private async _buildLibs(libs: IDependencyInfo[], onProjectBuildEnded?: BuildListener): Promise<IBuildStatusInfo[]> {
		const projects = libs.map(l => {
			return {isCompleted: false, project: l.project, dependencies: []} as IBuildStatusInfo;
		}).map((l, i, arr) => {
			l.dependencies = libs.find(lib => lib.project === l.project).dependencies.map(lib => arr.find(bInfo => bInfo.project === lib)).filter(p => !!p);
			return l;
		})

		let layer = this.getBuildLayer(projects);

		do {
			const tasks = [];
			for (let project of layer) {
				tasks.push(DotNetBuilder.build(project.project).then(res => {
					project.isCompleted = true;
					onProjectBuildEnded && onProjectBuildEnded(project.project);
				}).catch(err => {
					this.stopBuild(err);
				}));
			}
			await Promise.all(tasks);
			layer = this.getBuildLayer(projects);
		} while (layer.length);

		return projects;
	}

	private splitIntoChunks<T>(arr: T[], chunkSize: number): T[][] {
		let i, j, temporary, out = [];
		for (i = 0, j = arr.length; i < j; i += chunkSize) {
			temporary = arr.slice(i, i + chunkSize);
			out.push(temporary);
		}
		return out;
	}

	private async _buildContracts(projects: Project[], maxParallelCount: number, onProjectBuildEnded?: BuildListener): Promise<void> {
		const chunks = this.splitIntoChunks(projects, maxParallelCount);

		let index = 0;
		do {
			let chunk = chunks[index];
			const tasks = [];
			for (let project of chunk) {
				tasks.push(DotNetBuilder.buildContract(project).then(r => {
					onProjectBuildEnded && onProjectBuildEnded(project);
				}).catch(err => {
					this.stopBuild(err);
				}));
			}
			await Promise.all(tasks);
			index++;
		} while (index < chunks.length)
	}

	private async _buildServices(projects: Project[], maxParallelCount: number, onProjectBuildEnded?: BuildListener): Promise<void> {
		const chunks = this.splitIntoChunks(projects, maxParallelCount);

		let index = 0;
		do {
			let chunk = chunks[index];
			const tasks = [];
			for (let project of chunk) {
				tasks.push(DotNetBuilder.build(project).then(r => {
					onProjectBuildEnded && onProjectBuildEnded(project);
				}).catch(err => {
					this.stopBuild(err);
				}));
			}
			await Promise.all(tasks);
			index++;
		} while (index < chunks.length)
	}

	private stopBuild(err) {
		console.error(err);
		console.debug('Build stopped');
	}
}
