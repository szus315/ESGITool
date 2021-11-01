import Terminal from './terminal/terminal';

class App {
	public async start(): Promise<void> {
		const path = 'C:\\ESGI\\ESGI';
		new Terminal(path).start();
	}
}

new App().start()
