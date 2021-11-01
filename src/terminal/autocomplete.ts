import {Term} from '../features/term';

export default class Autocomplete {
	private dictionary: string[] = [];
	public constructor(private terms:Term[]) {
		for (let term of terms) {
			this.dictionary.push(...this.getPossibleTerms(term));
		}
	}

	private getPossibleTerms(term: Term): string[] {
		let out = [];
		if(term.innerTerms && term.innerTerms.length) {
			for (let innerTerm of term.innerTerms) {
				out.push(...this.getPossibleTerms(innerTerm));
			}
		}
		out = out.map(t => {
			t = term.word + ' ' + t;
			return t;
		})
		out.push(term.word);
		return out;
	}

	public process(input:string): string[] {
		if(!input) {
			return [];
		}
		return this.dictionary;
	}
}
