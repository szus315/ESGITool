import child_process from 'child_process';
import {ChildProcess} from 'child_process';
import find from 'find-process';
import fetch from 'node-fetch-commonjs';
import psList from 'ps-list';
import {terminal} from 'terminal-kit';
import {Project} from '../projects';

export default class ServiceTask {
	protected process: ChildProcess;
	protected pid: number;
	protected __alive: boolean = false;

	public get alive(): boolean {
		return this.__alive;
	}

	constructor(public readonly project: Project, private onExitCallback?: (project: Project) => void) {
	}

	public start() {
		try {
			const path = this.project.getConsoleCSProjPath();
			if (path) {
				const cmd = `cmd /c start /min dotnet run --project ${path} --no-build -silent -- -ip 127.0.0.1`
				this.process = child_process.exec(cmd, (res, stout, ar) => {
					this.__alive = false;
					this.onExitCallback && this.onExitCallback(this.project);
				});
				this.__alive = true;
				setTimeout(() => this.initPid(), 100);
			} else {
				return;
			}
		} catch (e) {

		}
	}

	private async initPid() {
		const pid = await this.getPid();
		if (pid) {
			this.pid = pid;
		}
	}

	// private async getPid() {
	// 	const res = await find('name', this.project.fullName);
	// 	const pss = res.find(p => p['bin'].toLowerCase() === this.project.getConsoleExePath().toLowerCase());
	// 	if (pss) {
	// 		return pss.pid;
	// 	}
	// }

	private async getPid() {
		const res = await psList();
		const pss = res.find(p => p.name.toLowerCase() === (this.project.fullName + '.console.exe').toLowerCase());
		if (pss) {
			return pss.pid;
		}
	}

	private async deregisterInLocalConsul(): Promise<void> {
		const consulUri = 'http://127.0.0.1:8500/v1/agent/services';
		const response = await fetch(consulUri);
		const json = await response.json() as Object;
		if (json) {
			for (let key in json) {
				const data = json[key];
				if (data && data.Service && typeof data.Service === 'string') {
					const serviceName = data.Service.toLowerCase();
					if (serviceName === this.project.additionalInfo.envType + '.' + this.project.name) {
						await fetch('http://127.0.0.1:8500/v1/agent/service/deregister/' + data.ID);
						return;
					}
				}
			}
		}
	}

	private async stopProcess(): Promise<void> {
		try {
			let pid = this.pid;
			if (!pid) {
				pid = await this.getPid();
			}
			process.kill(pid, 'SIGINT');
		} catch (e) {
			// terminal.red(`\n✖ ${this.project.fullName} - fail to stop.\n`)
		}
	}

	public async stop() {
		//Don't want to wait deregister
		this.deregisterInLocalConsul();
		await this.stopProcess();

		this.process && this.process.kill('SIGINT');
		this.__alive = false;
	}
}
