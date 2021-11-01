import {FileStructure} from './builders/helpers/file-structure';

export enum ProjectType {
	Lib,
	Service,
	Other
}

export interface IProjectInfo {
	port?: number,
	framework?: string,
	envType?: string,
	alias?: string | string[],
	runWith?: string[],
	customPath?: string
}

export class Project {
	public readonly name: string;
	public readonly type: ProjectType;
	private fileStructure: FileStructure;

	public get fullName(): string {
		if(this.type === ProjectType.Other) {
			return this.name;
		}
		return (this.additionalInfo.envType || '') + '.' + this.name;
	}

	constructor(
		name: string,
		type: ProjectType,
		fileStructure: FileStructure, public additionalInfo: IProjectInfo = {}
	) {
		this.name = name;
		this.type = type;
		this.fileStructure = fileStructure;

		if (!this.additionalInfo.envType && this.type === ProjectType.Lib) {
			this.additionalInfo.envType = 'esgi';
		}
	}

	getContractPath(): string {
		return this.fileStructure.getContractPath(this.name, this.additionalInfo.envType, this.type);
	}

	getConsoleExePath(): string {
		return this.fileStructure.getConsoleExePath(this.name, this.additionalInfo.envType, this.type, this.additionalInfo.framework);
	}

	getConsoleCSProjPath(): string {
		return this.fileStructure.getConsoleCSProjPath(this.name, this.additionalInfo.envType, this.type);
	}

	getSlnPath(): string {
		let env = this.additionalInfo.envType;
		if (this.additionalInfo.customPath) {
			return this.fileStructure.getSlnByCustomPath(this.additionalInfo.customPath);
		}
		return this.fileStructure.getSlnPath(this.name, env, this.type);
	}
}

export function GetLibs(fileStructure: FileStructure): Project[] {
	return [
		new Project('common', ProjectType.Lib, fileStructure),
		new Project('ioc', ProjectType.Lib, fileStructure),
		new Project('orm', ProjectType.Lib, fileStructure),
		new Project('enums', ProjectType.Lib, fileStructure),
		new Project('context', ProjectType.Lib, fileStructure),
		new Project('configuration', ProjectType.Lib, fileStructure),
		new Project('logger', ProjectType.Lib, fileStructure),
		new Project('metrics', ProjectType.Lib, fileStructure),
		new Project('queue', ProjectType.Lib, fileStructure),
		new Project('serviceclient', ProjectType.Lib, fileStructure),
		new Project('core', ProjectType.Lib, fileStructure),
		new Project('cache', ProjectType.Lib, fileStructure),
		new Project('servicecore', ProjectType.Lib, fileStructure),
		new Project('s3', ProjectType.Lib, fileStructure),
		new Project('jwt', ProjectType.Lib, fileStructure),
		new Project('migratorcore', ProjectType.Lib, fileStructure),
		new Project('genders', ProjectType.Lib, fileStructure),
	];
}

export function GetPreset(fileStructure: FileStructure): Project[] {
	return [
		new Project("web", ProjectType.Other, fileStructure,{
			runWith:["configstorage", "countries", "expirationdatecalculator", "accounts", "schools", "assets", "tracker", "assessments", "students", "registration", "notifications", "billing"]
		})
	];
}

export function GetServices(fileStructure: FileStructure): Project[] {
	return [
		new Project("configstorage", ProjectType.Service, fileStructure, {
			port: 9266,
			framework: "net5.0",
			envType: "esgi",
			alias: "config",
		}),
		new Project("files", ProjectType.Service, fileStructure, {
			port: 9270,
			framework: "net5.0",
			envType: "sso",
			runWith: ["configstorage"],
		}),
		new Project("excel", ProjectType.Service, fileStructure, {
			port: 9271,
			framework: "net5.0",
			envType: "sso",
			runWith: ["configstorage"],
		}),
		new Project("assets", ProjectType.Service, fileStructure, {
			port: 9253,
			framework: "net5.0",
			envType: "esgi",
		}),
		new Project("accounts", ProjectType.Service, fileStructure, {
			port: 9251,
			framework: "net5.0",
			envType: "esgi",
			alias: "eacc",
			runWith: ["configuration", "sso.accounts", "schoolyears"]
		}),
		new Project("tags", ProjectType.Service, fileStructure, {
			port: 9299,
			framework: "net5.0",
			envType: "esgi",
			runWith: ["configuration"]
		}),
		new Project("schools", ProjectType.Service, fileStructure, {
			port: 9250,
			framework: "net5.0",
			envType: "esgi",
			runWith: ["configuration", "schoolyears"]
		}),
		new Project("import", ProjectType.Service, fileStructure, {
			port: 9864,
			framework: "net5.0",
			envType: "esgi",
			runWith: ["configuration", "esgi.students", "esgi.schools", "esgi.accounts"]
		}),
		new Project("schoolyears", ProjectType.Service, fileStructure, {
			port: 9252,
			framework: "net5.0",
			envType: "esgi",
			alias: "sy",
			runWith: ["configuration"]
		}),
		new Project("students", ProjectType.Service, fileStructure, {
			port: 9254,
			framework: "net5.0",
			envType: "esgi",
		}),
		new Project("registration", ProjectType.Service, fileStructure, {
			port: 9258,
			framework: "net5.0",
			envType: "sso",
			alias: "reg",
			runWith: ["configuration", "countries", "schools", "schoolyears", "sso.accounts"]
		}),
		new Project("countries", ProjectType.Service, fileStructure, {
			port: 9261,
			framework: "net5.0",
			envType: "esgi",
			runWith: ["configuration"]
		}),
		new Project("expirationdatecalculator", ProjectType.Service, fileStructure, {
			port: 9304,
			framework: "net5.0",
			envType: "sso",
			alias: "exp",
			runWith: ["configuration"]
		}),
		new Project("export", ProjectType.Service, fileStructure, {
			port: 9211,
			framework: "net5.0",
			envType: "esgi",
			runWith: ["gradescales"]
		}),
		new Project("imagegallery", ProjectType.Service, fileStructure, {
			port: 9218,
			framework: "net5.0",
			envType: "esgi",
			alias: "images",
			runWith: ["configstorage"]
		}),
		new Project("pdf", ProjectType.Service, fileStructure, {
			port: 9204,
			framework: "net471",
			envType: "sso"
		}),
		new Project("scheduler", ProjectType.Service, fileStructure, {
			port: 9666,
			framework: "net5.0",
			envType: "esgi",
		}),
		new Project("sftp", ProjectType.Service, fileStructure, {port: 9217, framework: "net5.0", envType: "esgi",}),
		new Project("mailing", ProjectType.Service, fileStructure, {port: 9263, framework: "net5.0", envType: "esgi",}),
		new Project("monitoring", ProjectType.Service, fileStructure, {
			port: 8081,
			framework: "net5.0",
			envType: "esgi",
			runWith: ["configuration"]
		}),
		new Project("gradescales", ProjectType.Service, fileStructure, {
			port: 15487,
			framework: "net5.0",
			envType: "esgi",
			alias: "gs"
		}),
		new Project("zendesk", ProjectType.Service, fileStructure, {
			port: 9264,
			framework: "net5.0",
			envType: "esgi",
			runWith: ["configstorage", "SSO.smssender"]
		}),
		new Project("accounts", ProjectType.Service, fileStructure, {
			port: 9500,
			framework: "net5.0",
			envType: "sso",
			runWith: ["configstorage"]
		}),
		new Project("smssender", ProjectType.Service, fileStructure, {
			port: 9505,
			framework: "net5.0",
			envType: "sso",
			alias: "sms",
			runWith: ["configstorage"]
		}),
		new Project("clever", ProjectType.Service, fileStructure, {
			port: 9506,
			framework: "net5.0",
			envType: "sso",
			alias: "clever",
			runWith: ["configstorage"]
		}),
		new Project("classlink", ProjectType.Service, fileStructure, {
			port: 9507,
			framework: "net5.0",
			envType: "sso",
			alias: "classlink",
			runWith: ["configstorage"]
		}),
		new Project("tracker", ProjectType.Service, fileStructure, {
			port: 9501,
			framework: "net5.0",
			envType: "sso",
			runWith: ["configstorage"]
		}),
		new Project("highchartsexport", ProjectType.Service, fileStructure, {
			port: 10458,
			framework: "net5.0",
			envType: "esgi"
		}),
		new Project("reports", ProjectType.Service, fileStructure, {
			port: 9406,
			framework: "net5.0",
			envType: "esgi",
			runWith: ["assessments", "schoolyears", "assets", "esgi.students", "gradescales", "pdf", "highchartsexport"]
		}),
		new Project("apigateway", ProjectType.Service, fileStructure, {envType: 'sso', runWith: ["registration"]}),
		new Project("apigateway", ProjectType.Service, fileStructure, {
			framework: "net5.0",
			envType: "crm",
			runWith: ["sso.accounts", "esgi.countries", "esgi.schools"]
		}),
		new Project("parentconferencer", ProjectType.Service, fileStructure, {
			port: 9789,
			framework: "net5.0",
			envType: "esgi",
			alias: "esgipc",
		}),
		new Project("aeries", ProjectType.Service, fileStructure, {
			port: 9807,
			framework: "net5.0",
			envType: "sso",
			runWith: ["configuraiton"]
		}),
		new Project("eventhandlers", ProjectType.Service, fileStructure, {
			port: 12021,
			framework: "net5.0",
			envType: "crm",
			runWith: ["crm.consistencychecker"]
		}),
		new Project("google", ProjectType.Service, fileStructure, {
			port: 9331,
			framework: "net5.0",
			envType: "sso",
			runWith: ["configstorage"]
		}),
		new Project("notifications", ProjectType.Service, fileStructure, {
			port: 9267,
			framework: "net5.0",
			envType: "esgi",
			runWith: ["configstorage"]
		}),
		new Project("migrator", ProjectType.Service, fileStructure, {
			port: 9268,
			framework: "net5.0",
			envType: "esgi",
			runWith: ["configstorage"]
		}),
		new Project("testexplorer", ProjectType.Service, fileStructure, {
			port: 9886,
			framework: "net5.0",
			envType: "esgi",
			runWith: ["configstorage"],
			alias: "te"
		}),
		new Project("events", ProjectType.Service, fileStructure, {
			port: 9777,
			framework: "net5.0",
			envType: "sso",
			runWith: ["configstorage"]
		}),
		new Project("apigateway", ProjectType.Service, fileStructure, {
			port: 9779,
			framework: "net5.0",
			envType: "esgi",
			runWith: ["configstorage"]
		}),
		new Project("assessments", ProjectType.Service, fileStructure, {
			port: 10100,
			framework: "net5.0",
			envType: "esgi",
			runWith: ["configstorage"],
			alias: "ass"
		}),
		new Project("billing", ProjectType.Service, fileStructure, {
			port: 30125,
			framework: "net5.0",
			envType: "sso",
			runWith: ["configuration"]
		}),
	];
}
