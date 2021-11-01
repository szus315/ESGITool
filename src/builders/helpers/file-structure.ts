import * as fs from 'fs';
import * as path from 'path';
import {ProjectType} from '../../projects';

export class FileStructure {
	public constructor(private __basePath) {
	}

	private getFullProjectName(name: string, env: string) {
		return env + '.' + name;
	}

	private resolveProjectRootPath(name: string, envPrefix: string, type: ProjectType): string {
		let typePrefix;
		if (type === ProjectType.Lib) {
			typePrefix = 'Libs';
		}

		if (type === ProjectType.Service) {
			typePrefix = 'Services';
		}
		return path.resolve(this.__basePath, typePrefix, this.getFullProjectName(name, envPrefix));
	}

	public getContractPath(name: string, envPrefix: string, type: ProjectType) {
		const projName = this.getFullProjectName(name, envPrefix) + '.Contracts';
		const root = this.resolveProjectRootPath(name, envPrefix, type);
		const resPath = path.resolve(root, projName, projName + '.csproj');
		if (fs.existsSync(resPath)) {
			return resPath;
		}
		return '';
	}

	public getSlnByCustomPath(customPath: string) {
		return path.resolve(this.__basePath, customPath);
	}

	public getSlnPath(name: string, envPrefix: string, type: ProjectType): string {
		const root = this.resolveProjectRootPath(name, envPrefix, type);
		return path.resolve(root, this.getFullProjectName(name, envPrefix) + '.sln');
	}

	public getConsoleExePath(name: string, envPrefix: string, type: ProjectType, framework: string) {
		const projName = this.getFullProjectName(name, envPrefix) + '.Console';
		const root = this.resolveProjectRootPath(name, envPrefix, type);
		const binPrefix = 'bin';
		const binFullPath = path.resolve(root, projName, binPrefix);

		if (!framework && fs.existsSync(binFullPath)) {
			const frameworks = fs.readdirSync(binFullPath).sort();
			if (frameworks && frameworks.length) {
				framework = frameworks[0];
			}
		}

		const resPath = path.resolve(root, projName, binPrefix, framework, projName + '.exe');
		if (fs.existsSync(resPath)) {
			return resPath;
		}
		return null;
	}

	public getConsoleCSProjPath(name: string, envPrefix: string, type: ProjectType) {
		const projName = this.getFullProjectName(name, envPrefix) + '.Console';
		const root = this.resolveProjectRootPath(name, envPrefix, type);

		const resPath = path.resolve(root, projName, projName + '.csproj');
		if (fs.existsSync(resPath)) {
			return resPath;
		}
		return null;
	}
}
