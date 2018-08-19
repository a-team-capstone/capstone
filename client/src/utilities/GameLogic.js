import * as PIXI from 'pixi.js'
import keyboardTracker from './keyboardTracker'
import {wallFollowerBot} from './BotLogic'
import {addPowerUp} from './PowerUpsLogic'
import {createSprite} from './PixiObjects'
import * as move from './MoveLogic'

const createBoard = (img, maze, tileSize, startPoint, endPoint) => {

	console.log('running game logic')
	console.log('tileSize', tileSize)
	console.log('game height and ßwidth', gameHeight, gameWidth)

	let startY = startPoint[0] - (startPoint[0]%tileSize)
	let startX = startPoint[1] - (startPoint[1]%tileSize)
	let endY = endPoint[0] - (endPoint[0]%tileSize)
	let endX = endPoint[1] - (endPoint[1]%tileSize)
	let mazeTarget = {row: endY/tileSize, col: endX/tileSize}
	let gameHeight = maze.length * tileSize + 200
	let gameWidth = maze[0].length * tileSize

	let timeAllowed = 60 // hard coded for now
	let extraTimeX = startX + 100 // hard coded for now
	let extraTimeY = startY // hard coded for now


	let timeRemaining = timeAllowed

	var app = new PIXI.Application(gameWidth, gameHeight, { antialias: true, backgroundColor: 0x001099bb })

	var background = PIXI.Sprite.fromImage(img)
	background.anchor.x = 0
	background.anchor.y = 0
	background.position.x = 0
	background.position.y = 0
	background.height = maze.length*tileSize
	background.width = maze[0].length*tileSize

	var mazeGrid = maze

	var clearColor = 0xf7f8f9
	var blockedColor = 0x494845

	var board = new PIXI.Graphics()
	board.addChild(background)

	var extraTime = addPowerUp(board, extraTimeX, extraTimeY, tileSize, .25)

	var bot = wallFollowerBot(app, board, mazeGrid, tileSize, startX, startY)

	var startCircle = new PIXI.Graphics()
	startCircle.beginFill(0x00ff00)
	startCircle.drawCircle(startX, startY, tileSize*1.5)
	board.addChild(startCircle)

	// var endCircle = new PIXI.Graphics()
	// endCircle.beginFill(0x008BFE)
	// endCircle.drawCircle(endX, endY, tileSize*1.5)
	// board.addChild(endCircle)

	var endIcon = createSprite('star.png', endX, endY, .15)
	board.addChild(endIcon)

	// set state and track which state to run
	var state = setup
	app.ticker.add(function() {
			state()
	});

	function setup() {
		timeRemaining = timeAllowed
		player.x=startX
		player.y=startY
		bot.x=startX
		bot.y=startY
		board.visible = true;
		coordsText.visible = true;
		nav.visible = true;
		winScreen.visible = false;
		botWonScreen.visible = false;
		timeText.visible = true;
		state=play;

	}

	function play() {
		board.visible = true;
		bot.visible = true;
		player.visible = true;
		coordsText.visible = true;
		nav.visible = true;
		winScreen.visible = false;
		botWonScreen.visible = false;
		timeText.visible = true;
	}

	function end() {
		board.visible = false;
		bot.visible = false;
		player.visible = false;
		coordsText.visible = false;
		nav.visible = false;
		winScreen.visible = true;
		botWonScreen.visible = false;
		outOfTimeScreen.visible = false;
		timeText.visible = false;
	}

	function botWon() {
		board.visible = false;
		bot.visible = false;
		player.visible = false;
		coordsText.visible = false;
		nav.visible = false;
		winScreen.visible = false;
		botWonScreen.visible = true;
		outOfTimeScreen.visible = false;
		timeText.visible = false;
	}

	function outOfTime() {
		board.visible = false;
		bot.visible = false;
		player.visible = false;
		nav.visible = false;
		outOfTimeScreen.visible = true;
		timeText.visible = false;
	}



	// completion screen
	var winScreen = new PIXI.Graphics();
	winScreen.lineStyle(2, 0xf0ead6, 1);
	winScreen.beginFill(0xf7a409);
	winScreen.drawRoundedRect(0,0, gameWidth, gameHeight, 10);
	var winText = new PIXI.Text(
		"Maze complete!\nClick below to replay.",
		{fill:0xf9f9f7, fontSize: '40px'}
	);
	winText.x = 10;
	winText.y = 150;
	winScreen.addChild(winText)
	var replayButton = new PIXI.Graphics();
	replayButton.beginFill(0x494845)
	replayButton.drawRoundedRect(100, 400, 100, 50, 10);
	replayButton.interactive = true;
	replayButton.buttonMode = true;
	replayButton.on('pointerdown', ()=>{
		state=setup
	})
	winScreen.addChild(replayButton)

	// out of time screen
	var outOfTimeScreen = new PIXI.Graphics();
	outOfTimeScreen.lineStyle(2, 0xf0ead6, 1);
	outOfTimeScreen.beginFill(0x808080);
	outOfTimeScreen.drawRoundedRect(0,0, gameWidth, gameHeight, 10);
	var outOfTimeText = new PIXI.Text(
		"Out of time!\nClick below to replay.",
		{fill:0xf9f9f7, fontSize: '40px'}
	);
	outOfTimeText.x = 10;
	outOfTimeText.y = 150;
	outOfTimeScreen.addChild(outOfTimeText)
	var tryAgainButton = new PIXI.Graphics();
	tryAgainButton.beginFill(0x494845)
	tryAgainButton.drawRoundedRect(100, 400, 100, 50, 10);
	tryAgainButton.interactive = true;
	tryAgainButton.buttonMode = true;
	tryAgainButton.on('pointerdown', ()=>{
		state=setup
	})
	outOfTimeScreen.addChild(tryAgainButton)


		// out of time screen
		var botWonScreen = new PIXI.Graphics();
		botWonScreen.lineStyle(2, 0xf0ead6, 1);
		botWonScreen.beginFill(0x003366);
		botWonScreen.drawRoundedRect(0,0, gameWidth, gameHeight, 10);
		var botWonText = new PIXI.Text(
			"The bot beat you!\nClick below to replay.",
			{fill:0xf9f9f7, fontSize: '40px'}
		);
		botWonText.x = 10;
		botWonText.y = 150;
		botWonScreen.addChild(botWonText)
		var botWonButton = new PIXI.Graphics();
	botWonButton.beginFill(0xf7a409)
	botWonButton.drawRoundedRect(100, 400, 100, 50, 10);
	botWonButton.interactive = true;
	botWonButton.buttonMode = true;
	botWonButton.on('pointerdown', ()=>{
			state=setup
		})
		botWonScreen.addChild(botWonButton)




	app.ticker.add(()=>{
		if (timeRemaining > 0) {
		timeRemaining -= 1/60
		timeText.text = 'Time Remaining: '+Math.round(timeRemaining)
		}
		else {
			state = outOfTime
		}
	})

	app.stage.addChild(winScreen)
	app.stage.addChild(outOfTimeScreen)
	app.stage.addChild(botWonScreen)


	// Add board tiles. Currently set to transparent
	var tiles = new PIXI.Graphics()
	tiles.alpha = 0

	for (var row = 0; row < maze[0].length; row++){
		for (var col = 0; col < maze.length; col++){
		// draw a rectangle
			tiles.beginFill(mazeGrid[col][row] ? blockedColor : clearColor);
		tiles.drawRoundedRect(row*tileSize, col*tileSize, tileSize, tileSize, 10);
		}
	}
	board.addChild(tiles)

	board.x = 0
	board.y = 0
	app.stage.addChild(board);

	// Keyboard navigation

	//Capture the keyboard arrow keys
	let leftKey = keyboardTracker(37),
			upKey = keyboardTracker(38),
			rightKey = keyboardTracker(39),
			downKey = keyboardTracker(40)

	// arrow key movement
	let frames = 0
	app.ticker.add(()=>{
		frames++
		if (frames%4 ===0){
			if (leftKey.isDown) move.left(player, mazeGrid, tileSize)
			if (rightKey.isDown) move.right(player, mazeGrid, tileSize)
			if (upKey.isDown) move.up(player,mazeGrid, tileSize)
			if (downKey.isDown) move.down(player, mazeGrid, tileSize)
		}
	})
		// nav button movement
		app.ticker.add(()=>{
			if (currentBunnyDirection && (frames%4 === 0)) currentBunnyDirection(player, mazeGrid, tileSize)
		})

	leftKey.press = () => {
		move.left(player, mazeGrid, tileSize)
	}

	rightKey.press = () => {
		move.right(player, mazeGrid, tileSize)
	}

	upKey.press = () => {
		move.up(player, mazeGrid, tileSize)
	}

	downKey.press = () => {
		move.down(player, mazeGrid, tileSize)
	}


	// navigation buttons
	var nav = new PIXI.Container();


	// draw a rectangle for right button
	var right = new PIXI.Graphics();
	right.lineStyle(2, 0xf0ead6, 1);
	right.beginFill(0x494845);
	right.drawRoundedRect(180,45,90,90,10);
	// Opt-in to interactivity, show hand curser normalize touch and mouse
	right.interactive = true;
	right.buttonMode = true;
	right.on('pointerdown', () => currentBunnyDirection = move.right);
	right.on('pointerup', () => currentBunnyDirection = null);
	// add button to nav container
	nav.addChild(right)


	// draw a rectangle for left button
	var left = new PIXI.Graphics();
	left.lineStyle(2, 0xf0ead6, 1);
	left.beginFill(0x494845);
	left.drawRoundedRect(0,45,90,90, 10);
	// Opt-in to interactivity, show hand curser normalize touch and mouse
	left.interactive = true;
	left.buttonMode = true;
	left.on('pointerdown', () => currentBunnyDirection = move.left);
	left.on('pointerup', () => currentBunnyDirection = null);	// add button to nav container
	nav.addChild(left)


	// draw a rectangle for up button
	var up = new PIXI.Graphics();
	up.lineStyle(2, 0xf0ead6, 1);
	up.beginFill(0x494845);
	up.drawRoundedRect(90,0,90,90, 10);

	// Opt-in to interactivity, show hand curser normalize touch and mouse
	up.interactive = true;
	up.buttonMode = true;
	up.on('pointerdown', () => currentBunnyDirection = move.up);
	up.on('pointerup', () => currentBunnyDirection = null);	// add button to nav container
	nav.addChild(up)

	// draw a rectangle for down button
	var down = new PIXI.Graphics();
	down.beginFill(0x494845);
	down.lineStyle(2, 0xf0ead6, 1);
	down.drawRoundedRect(90,90,90,90,10);
	// Opt-in to interactivity, show hand curser normalize touch and mouse
	down.interactive = true;
	down.buttonMode = true;
	down.on('pointerdown', () => currentBunnyDirection = move.down);
	down.on('pointerup', () => currentBunnyDirection = null);
	// add button to nav container
	nav.addChild(down)


	nav.x = 150
	nav.y = 805
	app.stage.addChild(nav);

	var player = createSprite('shield.png', startX, startY, .2)
	board.addChild(player);

	let currentBunnyDirection = 0


	// record player.x and player.y
	var coordsText = new PIXI.Text(
		'X: '+player.x+'\nY: '+player.y,
		{fill:0xf9f9f7}
	);
	coordsText.x = 10;
	coordsText.y = 810;
	app.stage.addChild(coordsText);

	// record time remaining
		var timeText = new PIXI.Text(
			'Time remaining: '+Math.round(timeRemaining),
			{fill:0x000000}
		);
		timeText.x = 350;
		timeText.y = 810;
		app.stage.addChild(timeText);

	// update coordinates and check if reached target
	app.ticker.add(function() {
		coordsText.text = 'X: '+player.x+'\nY: '+player.y

		// check if player reached target
		if (overlapping(player, mazeTarget)) {
				state = end
		}

		// check if bot reached target
		if (overlapping(bot, mazeTarget)) {
			state = botWon
		}

	})

	// check if powerups should be activated
	app.ticker.add(function() {
		if (extraTime && overlapping(player, extraTime))
		{
			timeRemaining += 10
			extraTime.destroy()
			extraTime = null
		}
	})


	// check if a sprite has reached a certain target
	function overlapping(sprite, target){
		let targetX, targetY
		if (target.row && target.col) {
			targetY = target.row * tileSize// - tileSize
			targetX = target.col * tileSize// - tileSize
		} else {
			targetY = target.y
			targetX = target.x
		}
		const proximityX = Math.abs(sprite.x - targetX)
		const proximityY = Math.abs(sprite.y - targetY)
		const proximityRequirement = tileSize * 2

		const areOverlapping = (proximityX <= proximityRequirement) && (proximityY <= proximityRequirement)

		return areOverlapping
	}

	return app
}

export default createBoard
