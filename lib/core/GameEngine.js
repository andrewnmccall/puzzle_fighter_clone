export default class GameEngine {
	/** @type {CanvasRenderingContext2D} */
	ctx;
	canvas;
	currentTime=0;
	diffTime=0;
	lastUpdateTime=0;
	/** @type {GameObject[]} */
	gameObjects = [];
	buttons = {
		arrowRight: {pressed: false},
		arrowLeft: {pressed: false},
		arrowDown: {pressed: false},
		space: {pressed: false},
	};

	constructor() {
		this.canvas = document.getElementById("game_screen");
		this.ctx = this.canvas.getContext("2d");
		document.addEventListener("keydown", e => this.keyDownHandler(e), false);
		document.addEventListener("keyup", e => this.keyUpHandler(e), false);
	}

	keyDownHandler(e) {
		if(e.key == "Right" || e.key == "ArrowRight") {
			this.buttons.arrowRight.pressed = true;
		} else if(e.key == "Left" || e.key == "ArrowLeft") {
			this.buttons.arrowLeft.pressed = true;
		} else if(e.key == "Down" || e.key == "ArrowDown") {
			this.buttons.arrowDown.pressed = true;
		} else if(e.key == " ") {
			this.buttons.space.pressed = true;
		}
	}

	keyUpHandler(e) {
		if(e.key == "Right" || e.key == "ArrowRight") {
			this.buttons.arrowRight.pressed = false;
		} else if(e.key == "Left" || e.key == "ArrowLeft") {
			this.buttons.arrowLeft.pressed = false;
		} else if(e.key == "Down" || e.key == "ArrowDown") {
			this.buttons.arrowDown.pressed = false;
		} else if(e.key == " ") {
			this.buttons.space.pressed = false;
		}
	}

	start() {
		setInterval(() => {
			this.update();
			this.render();
		}, 10);
	}

	addGameObject(gameObject) {
		gameObject.gameEngine = this;
		this.gameObjects.push(gameObject);
	}

	removeGameObject(gameObject) {
		const index = this.gameObjects.indexOf(gameObject);
		if (index !== -1) {
			this.gameObjects.splice(index, 1);
		}
	}

	update() {
		this.currentTime = window.performance.now();
		this.diffTime = this.currentTime - this.lastUpdateTime;
		if(this.buttons.arrowRight.pressed) {
			this.player.position.x +=1;
		}
		if(this.buttons.arrowLeft.pressed) {
			this.player.position.x -=1;
		}
		this.gameObjects.forEach(go => go.update());
		this.lastUpdateTime = this.currentTime;
	}

	render() {
		const canvas = this.canvas;
		const ctx = this.ctx;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		this.gameObjects.forEach(go => go.draw(canvas));
		// ctx.beginPath();
		// ctx.rect(20, 40, 50, 50);
		// ctx.fillStyle = "#FF0000";
		// ctx.fill();
		// ctx.closePath();
		
		// ctx.beginPath();
		// ctx.arc(this.ballX, this.ballY, 20, 0, Math.PI*2, false);
		// ctx.fillStyle = "green";
		// ctx.fill();
		// ctx.closePath();
		
		// ctx.beginPath();
		// ctx.rect(160, 10, 100, 40);
		// ctx.strokeStyle = "rgba(0, 0, 255, 0.5)";
		// ctx.stroke();
		// ctx.closePath();
	}
}
