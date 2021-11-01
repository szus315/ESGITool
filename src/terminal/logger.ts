export default class Logger {
	private static _instance: Logger;
	public static get instance() {
		return this._instance ? this._instance : this._instance = new Logger();
	}

	protected constructor() {
	}

	public log(message?: any, ...optionalParams: any[]) {
		console.log(message);
	}

	public warn(message?: any, ...optionalParams: any[]) {
		console.warn(message);
	}

	public info(message?: any, ...optionalParams: any[]) {
		console.info(message);
	}

	public debug(message?: any, ...optionalParams: any[]) {
		console.debug(message);
	}

	public err(message?: any, ...optionalParams: any[]) {
		console.error(message);
	}
}
