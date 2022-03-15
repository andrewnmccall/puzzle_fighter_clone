import { GameObject, GameEngine, Point } from "./lib/core/index.js";

class PlayerInfo extends GameObject {
}
class PuzzlePiece extends GameObject {
	static SIZE = 40;
	static SHAPE_DIAMOND = "diamond";
	static SHAPE_CIRCLE = "circle";
	static COLORS = [
		"red",
		"green",
		"yellow",
		"blue"
	];
	color;
	shape;

	/**
	 * 
	 * @param {HTMLCanvasElement} canvas 
	 */
	draw(canvas) {
		/** @type {CanvasRenderingContext2D} */
		const ctx = canvas.getContext("2d");
		const x = this.position.x;
		const y = this.position.y;
		const width = PuzzlePiece.SIZE;
		const height = PuzzlePiece.SIZE;
		ctx.beginPath();
		if(this.shape == PuzzlePiece.SHAPE_DIAMOND) {
			ctx.moveTo(x, y + height / 2);
			ctx.lineTo(x + width / 2, y);
			ctx.lineTo(x+width, y + height / 2);
			ctx.lineTo(x + width / 2, y + height);
		} else {
			ctx.arc(x + width/2, y + width/2, width/2, 0, Math.PI*2, false);
		}
		ctx.fillStyle = this.color || "green";
		ctx.fill();
		ctx.closePath();
	}
}
class PuzzleGrid extends GameObject {

	rows = 15;
	columns = 6;
	/** @type {Object[][]} */
	positions;

	
	constructor() {
		super();
		this.positions = new Array(this.columns);
		for(let i = 0; i < this.columns; i++){
			this.positions[i] = new Array(this.rows);
		}
		this.positions[0][14] = {color: "red"};
		this.positions[1][14] = {color: "yellow"};
	}
	/**
	 * 
	 * @param {HTMLCanvasElement} canvas 
	 */
	draw(canvas) {
		/** @type {CanvasRenderingContext2D} */
		const ctx = canvas.getContext("2d");
		this.positions.forEach((rows, col) => {
			rows.forEach((block, row) => {
				if(!block.color) {
					return;
				}
				ctx.beginPath();
				const x = col * 42 + this.position.x;
				const y = row * 42 + this.position.y;
				const width = PuzzlePiece.SIZE;
				const height = PuzzlePiece.SIZE;
				if(block.shape == PuzzlePiece.SHAPE_DIAMOND) {
					ctx.moveTo(x, y + height / 2);
					ctx.lineTo(x + width / 2, y);
					ctx.lineTo(x+width, y + height / 2);
					ctx.lineTo(x + width / 2, y + height);
				} else {
					ctx.arc(x + width/2, y + width/2, width/2, 0, Math.PI*2, false);
				}
				ctx.fillStyle = block.color;
				ctx.fill();
				ctx.closePath();
			});
		});
	}

	setPositionDetails(x, y, details) {
		this.positions[x][y] = details;
	}

	/** @returns {boolean} */
	canClaim(x, y) {
		if(x >= this.columns || x < 0 || y >= this.rows || y < 0) {
			return false;
		}
		if(this.positions[x][y] && this.positions[x][y].color) {
			return false;
		}
		return true;
	}

	getPositionDetails(x, y) {
		return this.positions[x][y] || {};
	}

	/**
	 * 
	 * @returns {[int, int, object][]}
	 */
	getFlatPositions() {
		return this.positions.flatMap((rows, col) => rows.map((block, row) => [col,row,block]));
	}

	checkAndClear() {
		this.getFlatPositions().forEach(([col, row, block]) => {
			if(block.shape == PuzzlePiece.SHAPE_DIAMOND) {
				if(this.clearChain(col, row, block.color) > 0) {
					this.positions[col][row] = {};
				}
			}
		});
		this.collapseDown();
	}

	collapseDown() {
		this.positions.forEach((rows, col) => {
			let drop = 0;
			for(let i = rows.length-1; i>-1; i--) {
				if(!rows[i] || !rows[i].color) {
					drop++;
				} else if(drop) {
					rows[i+drop] = rows[i];
					rows[i] = {};
				}
			}
		});
	}

	clearChain(x, y, color, direction = {x: 0, y: 0}) {
		let matchCount = 0;
		if(direction.x != 1 && x > 0 && this.positions[x-1][y] && this.positions[x-1][y].color == color) {
			this.positions[x-1][y] = {};
			matchCount += this.clearChain(x-1, y, color, {x: -1}) + 1;
		}
		if(direction.y != 1 && y > 0 && this.positions[x][y-1] && this.positions[x][y-1].color == color) {
			this.positions[x][y-1] = {};
			matchCount += this.clearChain(x, y-1, color, {y: -1}) + 1;
		}
		if(direction.x != !1 && x < this.columns-1 && this.positions[x+1][y] && this.positions[x+1][y].color == color) {
			this.positions[x+1][y] = {};
			matchCount += this.clearChain(x+1, y, color, {x: 1}) + 1;
		}
		if(direction.y != -1 && y < this.rows-1 && this.positions[x][y+1] && this.positions[x][y+1].color == color) {
			this.positions[x][y+1] = {};
			matchCount += this.clearChain(x, y+1, color, {y: 1}) + 1;
		}
		return matchCount;
	}
}

export class PuzzleFighterGameEngine extends GameEngine {
	ballX = 0;
	ballY = 0;
	dropSpeed = 1000;
	lastDrop = 0;
	clearPieceChance = 0;
	/** @type {PuzzlePiece|undefined} */
	player;
	/** @type {PuzzlePiece|undefined} */
	playerPiece2;
	/** @type {Point} */
	playerPiece2Offset;
	/** @type {PuzzleGrid} */
	puzzleGrid;

	constructor() {
		super();
		// for(let i=0; i<10; i++) {
		// 	let go = new GameObject();
		// 	go.position.set({x: Math.random() * 500, y: Math.random() * 500});
		// 	go.velocity.set({x: (Math.random() - 0.5)*25, y: (Math.random() - 0.5)*25});
		// 	this.addGameObject(go);
		// }
		this.createPlayerPuzzlePiece();
		this.puzzleGrid = new PuzzleGrid();
		this.puzzleGrid.position.x = 30;
		this.addGameObject(this.puzzleGrid);
	}

	createPlayerPuzzlePiece() {
		if(this.player) {
			this.removeGameObject(this.player);
			this.removeGameObject(this.playerPiece2);
		}
		this.ballX = 0;
		this.ballY = 0;
		this.player = new PuzzlePiece();
		this.player.shape = Math.random() < 0.1 ? PuzzlePiece.SHAPE_DIAMOND : PuzzlePiece.SHAPE_CIRCLE;
		this.clearPieceChance = this.player.shape == PuzzlePiece.SHAPE_DIAMOND ? 0 : this.clearPieceChance + .1;
		this.player.color = PuzzlePiece.COLORS[parseInt(Math.min(3, Math.random()*4))];
		this.addGameObject(this.player);

		this.playerPiece2 = new PuzzlePiece();
		this.playerPiece2.shape = Math.random() < 0.1 ? PuzzlePiece.SHAPE_DIAMOND : PuzzlePiece.SHAPE_CIRCLE;
		this.clearPieceChance = this.playerPiece2.shape == PuzzlePiece.SHAPE_DIAMOND ? 0 : this.clearPieceChance + .1;
		this.playerPiece2.color = PuzzlePiece.COLORS[parseInt(Math.min(3, Math.random()*4))];
		this.addGameObject(this.playerPiece2);
		this.playerPiece2Offset = new Point({x:0, y:-1});
	}

	update() {
		this.currentTime = window.performance.now();
		this.diffTime = this.currentTime - this.lastUpdateTime;
		this.gameObjects.forEach(go => go.update());
		if(!this.moving) {
			if(this.buttons.arrowRight.pressed && this.puzzleGrid.canClaim(this.ballX + 1 + this.playerPiece2Offset.x, this.ballY)) {
				this.ballX++;
			}
			if(this.buttons.arrowLeft.pressed && this.puzzleGrid.canClaim(this.ballX - 1 + this.playerPiece2Offset.x, this.ballY)) {
				this.ballX--;
			}
		}
		this.moving = this.buttons.arrowRight.pressed || this.buttons.arrowLeft.pressed;

		if(!this.rotating && this.buttons.space.pressed) {
			const newX = this.playerPiece2Offset.y;
			this.playerPiece2Offset.y = -this.playerPiece2Offset.x;
			this.playerPiece2Offset.x = newX;
		}
		this.rotating = this.buttons.space.pressed;

		//correct x positioning
		this.ballX = Math.min(this.ballX+1, this.puzzleGrid.columns-1);
		this.ballX = Math.max(this.ballX-1, 0);


		let drop =false;
		if(this.dropSpeed + this.lastDrop < this.currentTime || this.buttons.arrowDown.pressed) {
			drop = true;
		}
		if(drop) {
			// check collision
			if(
				this.puzzleGrid.canClaim(this.ballX, this.ballY + 1)
				&& this.puzzleGrid.canClaim(this.ballX + this.playerPiece2Offset.x, this.ballY + 1 + this.playerPiece2Offset.y)
			) {
				this.ballY++;
				this.lastDrop = this.currentTime;
			} else {
				this.puzzleGrid.setPositionDetails(this.ballX, this.ballY, {
					color: this.player.color,
					shape: this.player.shape
				});
				this.puzzleGrid.setPositionDetails(this.ballX + this.playerPiece2Offset.x, this.ballY + this.playerPiece2Offset.y, {
					color: this.playerPiece2.color,
					shape: this.playerPiece2.shape
				});
				this.puzzleGrid.checkAndClear();
				this.createPlayerPuzzlePiece();
			}
		}
		this.player.position.x = (this.ballX * (PuzzlePiece.SIZE + 2)) + this.puzzleGrid.position.x;
		this.player.position.y = (this.ballY * (PuzzlePiece.SIZE + 2)) + this.puzzleGrid.position.y;
		this.playerPiece2.position.x = ((this.ballX + this.playerPiece2Offset.x) * (PuzzlePiece.SIZE + 2)) + this.puzzleGrid.position.x;
		this.playerPiece2.position.y = ((this.ballY + this.playerPiece2Offset.y) * (PuzzlePiece.SIZE + 2)) + this.puzzleGrid.position.y;
		this.lastUpdateTime = this.currentTime;
	}
}
