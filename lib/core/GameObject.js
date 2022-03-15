import Point from './Point.js';

export default class GameObject {
	id;
	/**
	 * @type {Object.<Symbol, GameComponent>}
	 */
	components;

	/** @type {Point} */
	position;

	/** @type {Point} */
	size;

	/** @type {Point} */
	velocity;

	/** @type {GameEngine} */
	gameEngine;

	constructor() {
		this.position = new Point();
		this.size = new Point();
		this.velocity = new Point();
	}

	/**
	 * 
	 * @param {GameComponent} gameComponent 
	 */
	addGameComponent(gameComponent) {
		this.components[gameComponent.getSymbol()] = gameComponent;
		return this;
	}

	update() {
		this.position.x += (this.gameEngine.diffTime/1000) * this.velocity.x;
		this.position.y += (this.gameEngine.diffTime/1000) * this.velocity.y;
	}

	/**
	 * 
	 * @param {HTMLCanvasElement} canvas 
	 */
	draw(canvas) {
	}
}
