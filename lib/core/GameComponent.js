export default class GameComponent {
	/** @property {GameObject} */
	gameObject;

	static Symbol = Symbol("GameComponent");

	/**
	 * 
	 * @param {GameObject} gameObject 
	 */
	constructor(gameObject) {
		this.gameObject = gameObject;
	}

	update() {
		
	}

	/**
	 * @returns {Symbol}
	 */
	getSymbol() {
		return GameComponent.Symbol;
	}
}
