import {exec} from 'child_process';
import Logger from '../../terminal/logger';
import {Project} from '../../projects';

const types = ['ESGI', 'CRM', 'SSO']

function isESGIPackage(name) {
	for (let type of types) {
		if (name.startsWith(type)) {
			return true;
		}
	}
	return false;
}

export default class DependencyInfo {
	public static async getDependencies(project: Project): Promise<string[]> {
		const path = project.getSlnPath();
		const cmd = 'dotnet list ' + path + ' package -v q';
		return new Promise<string[]>((resolve, reject) => {
			exec(cmd, (err, stdout, stderr) => {
				const rg = /(>\s*\w*\.\w*)/g;
				let packages = stdout.match(rg);
				packages = packages.map(p => p.split('> ')[1]).filter(p => p && isESGIPackage(p)).filter((p, i, arr) => arr.indexOf(p) === i);
				resolve(packages || []);
				if(err || stderr) {
					Logger.instance.err(stderr);
					reject(err);
				}
			});
		});
	}
}
