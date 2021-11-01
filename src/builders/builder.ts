import {exec} from 'child_process';
import Logger from '../terminal/logger';
import {Project} from '../projects';

export default class DotNetBuilder {
	public static defaultBuildCommand: string = 'dotnet build --force /nologo /consoleloggerparameters:ErrorsOnly';

	public static async build(project: Project, buildCmd?: string): Promise<string> {
		const path = project.getSlnPath();
		return this._build(path, buildCmd);

	}

	public static async buildContract(project: Project, buildCmd?: string): Promise<string> {
		const path = project.getContractPath();
		return this._build(path, buildCmd);
	}

	public static async buildConsole(project: Project, buildCmd?: string): Promise<string> {
		const path = project.getConsoleCSProjPath();
		return this._build(path, buildCmd);
	}

	private static _build(path: string, buildCmd?: string): Promise<string> {
		return new Promise((resolve, reject) => {
			if (!path) {
				resolve();
			}
			const command = (buildCmd || this.defaultBuildCommand) + ' ' + path;
			exec(command, (err, stdout, stderr) => {
				if (err || stderr) {
					Logger.instance.err(stderr);
					reject(err);
				}
				resolve(stdout);
			});
		});
	}
}
