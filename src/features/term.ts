import {TerminalColors} from '../terminal/colors';

type Action<T> = () => Promise<T>;

export class Term {
	constructor(public readonly word: string, public readonly color: string, public readonly innerTerms: Term[], private action: Action<any>) {
	}

	isThisTerm(inputString: string) {
		const input = inputString.toLowerCase().trim(), word = this.word.toLowerCase();
		if (!input) {
			return false;
		}
		if (input === word) {
			return true;
		}
		return input.startsWith(word);
	}

	async executeAction(inputString: string) {
		const input = inputString.toLowerCase().trim(), word = this.word.toLowerCase();
		if (!input) {
			return null;
		}
		if (input === word && this.action) {
			await this.action();
		}
		if(input.startsWith(word)) {
			const terms = input.split(word);
			const rightPart = terms[1];
			if (rightPart) {
				if (this.innerTerms && this.innerTerms.length) {
					let term = this.innerTerms.find(t => t.isThisTerm(rightPart));
					if (term) {
						return await term.executeAction(rightPart);
					}
				}
			}
		}
	}

	getColor(inputString: string): string {
		const input = inputString.toLowerCase().trim(), word = this.word.toLowerCase();
		if (!input) {
			return 'white';
		}
		if (input === word) {
			return this.color;
		}
		if (input.startsWith(word)) {
			const terms = input.split(word);
			const rightPart = terms[1];
			if (rightPart) {
				if (this.innerTerms && this.innerTerms.length) {
					let term = this.innerTerms.find(t => t.isThisTerm(rightPart));
					if (term) {
						return term.getColor(rightPart.trim());
					}
				}
			}
			return this.color;
		} else {
			return null;
		}
	}
}

export class TermBuilder {
	public static create(name: string): TermBuilder {
		return new TermBuilder(name);
	}

	private action: Action<any>;
	private innerTerms: Term[];
	private color: string;

	protected constructor(private name: string) {
	}


	public withAction(action: Action<any>): TermBuilder {
		this.action = action;
		return this;
	}

	public withColor(color: TerminalColors): TermBuilder {
		this.color = color
		return this;
	}

	public withInnerTerms(innerTerms: Term[]): TermBuilder {
		this.innerTerms = innerTerms;
		return this;
	}

	public build(): Term {
		return new Term(this.name, this.color, this.innerTerms, this.action)
	}
}
