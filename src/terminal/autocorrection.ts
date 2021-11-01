export default class Autocorrection {
	public constructor(private dictionary: string[], private sensitive: number = 0.5) {
	}

	public process(input: string): string {
		let maxSimilarity = 0, mostSimilar = input;
		for (let word of this.dictionary) {
			const similarity = this.getSimilarity(input, word);
			if(similarity > maxSimilarity) {
				maxSimilarity = similarity;
				mostSimilar = word;
			}
		}
		return maxSimilarity >= this.sensitive ? mostSimilar.slice(0, input.length) : input;
	}

	private getSimilarity(word1: string, word2: string): number {
		const w1 = word1.toLowerCase(), w2 = word2.toLowerCase();
		const bigr1 = this.getBigrams(w1), bigr2 = this.getBigrams(w2);
		let similar = [];

		for (let i = 0; i < bigr1.length; i++) {
			if (bigr2.indexOf(bigr1[i]) > -1) {
				similar.push(bigr1[i]);
			}
		}
		return similar.length / Math.max(bigr1.length, bigr2.length);
	}

	private getBigrams(word: string): string[] {
		let out = [];
		for (let i = 0; i < word.length - 1; i++) {
			out.push(word[i] + word[i + 1]);
		}
		return out;
	}
}
