import * as PIXI from 'pixi.js'
import keyboardTracker from './keyboardTracker'
import { wallFollowerBot } from './BotLogic'
import { addPowerUp, activateTeleport } from './PowerUpsLogic'
import { createSprite } from './PixiObjects'
import * as move from './MoveLogic'
import {overlapping} from './MoveLogic'
import {createGameScreen, createButton, createPowerUpsScreen, createOverlay} from './GameScreens'
import axios from 'axios'

const createBoard = (img, mazeInstance, tileSize, startPoint, endPoint, user) => {
	let maze = mazeInstance.data.data

  let {WPN, FRZ, XTM, BMB, TEL, SLD, PRT, time} = mazeInstance

	let startY = startPoint[0] - (startPoint[0] % tileSize)
	let startX = startPoint[1] - (startPoint[1] % tileSize)
	let endY = endPoint[0] - (endPoint[0] % tileSize)
	let endX = endPoint[1] - (endPoint[1] % tileSize)
	let mazeTarget = { row: endY / tileSize, col: endX / tileSize }
	let gameHeight = maze.length * tileSize + 200
	let gameWidth = maze[0].length * tileSize
	let mazeHeight = maze.length * tileSize
	let mazeWidth = maze[0].length * tileSize

	let timeAllowed = time
	let extraTimeX = XTM? XTM[1] : -999
	let extraTimeY = XTM? XTM[0] : -999
	let weaponX = WPN? WPN[1] : startX+400
	let weaponY = WPN? WPN[0] : startY
	let slowDownX = SLD? SLD[1] : startX+200
	let slowDownY = SLD? SLD[0] : startY
	let bombX = BMB? BMB[1] : -999
	let bombY = BMB? BMB[0] : -999
	let teleX = TEL? TEL[1] : -999
	let teleY = TEL? TEL[0] : -999
	let portX = PRT? PRT[1] : -999
	let portY = PRT? PRT[0] : -999
	let freezeX = FRZ? FRZ[1] : -999
	let freezeY = FRZ? FRZ[0] : -999

	let timeRemaining = timeAllowed

	let app = new PIXI.Application(gameWidth, gameHeight, { antialias: true, backgroundColor: 0x167AF6 })

	let background = PIXI.Sprite.fromImage(img)
	background.anchor.x = 0
	background.anchor.y = 0
	background.position.x = 0
	background.position.y = 0
	background.height = maze.length * tileSize
	background.width = maze[0].length * tileSize

	let mazeGrid = maze

	let clearColor = 0xf7f8f9
	let blockedColor = 0x494845

	let board = new PIXI.Graphics()
	board.addChild(background)

	let extraTime = addPowerUp(
		'hourGlassYellow.png',
		board,
		extraTimeX,
		extraTimeY,
		tileSize,
		0.25
	)

	let bomb = addPowerUp('bomb.png', board, bombX, bombY, tileSize, 0.3)

	let tele = addPowerUp('tele.png', board, teleX, teleY, tileSize, 0.5)

	let port = addPowerUp('port.png', board, portX, portY, tileSize, 0.5)

	let freeze = addPowerUp('freeze.png', board, freezeX, freezeY, tileSize, 0.15)

	// let startCircle = new PIXI.Graphics()
	// startCircle.beginFill(0x00ff00)
	// startCircle.drawCircle(startX, startY, tileSize * 1.5)
	// board.addChild(startCircle)

	// create player
	let player = createSprite('shield.png', startX, startY, 0.2)
	board.addChild(player)
	let currentPlayerDirection = 0

	let endIcon = createSprite('star.png', endX, endY, 0.17)
	board.addChild(endIcon)

	let botLevelUnlocked = false
	let useBot = false
	// set all bot related things out of sight

	let bot = wallFollowerBot(app, board, mazeGrid, tileSize, -111, -111, endX, endY) // bot setup
	let weapon = addPowerUp('sword.png', board, -999, -999, tileSize, .2) // bot setup
	let slowDown = addPowerUp('slowDown.png', board, -999, -999, tileSize, .15) // bot setup


	// set state and track which state to run
	let state = play
	app.ticker.add(function() {
		state()
	})

	function setup() {
		timeRemaining = timeAllowed

		player.x=startX
		player.y=startY
		board.visible = true;
		coordsText.visible = true;
		nav.visible = true;
		winScreen.visible = false;
		botWonScreen.visible = false;
		timeText.visible = true;
		timeTitle.visible = true;
		freezeOverlay.visible = false;

		// set all bot related things out of sight
		// if (bot) bot.destroy()
		bot = wallFollowerBot(app, board, mazeGrid, tileSize, -111, -111, endX, endY)
		if (weapon) weapon.destroy()
		weapon = addPowerUp('sword.png', board, -999, -999, tileSize, .2)
		if (slowDown) slowDown.destroy()
		slowDown = addPowerUp('slowDown.png', board, -999, -999, tileSize, .15)

		// reset powerups
		if (extraTime) extraTime.destroy()
		extraTime = addPowerUp(
			'hourGlassYellow.png',
			board,
			extraTimeX,
			extraTimeY,
			tileSize,
			0.25
		)

		if (bomb) bomb.destroy()
		bomb = addPowerUp('bomb.png', board, bombX, bombY, tileSize, 0.3)

		freezeCount = 180
		freezePlayer = false
		freezeBot = false
		if (freeze) freeze.destroy()
		freeze = addPowerUp('freeze.png', board, freezeX, freezeY, tileSize, 0.15)


		state = useBot? setupBot : play;
	}

	function setupBot() {
		//reset bot
		// if (bot) bot.destroy()
		bot = wallFollowerBot(app, board, mazeGrid, tileSize, startX, startY, endX, endY, 2)

		// reset powerups
		if (slowDown) slowDown.destroy()
		slowDown = addPowerUp(
			'slowDown.png',
			board,
			slowDownX,
			slowDownY,
			tileSize,
			0.15
		)

		if (weapon) weapon.destroy()
		weapon = addPowerUp('sword.png', board, weaponX, weaponY, tileSize, 0.2)
		weaponGrabbed = false

		state = play
	}

	function play() {

		board.visible = true;
		bot.visible = true;
		player.visible = true;
		coordsText.visible = true;
		countdown.visible = false
		nav.visible = true;
		winScreen.visible = false;
		botScreen.visible = false
		botWonScreen.visible = false;
		outOfTimeScreen.visible = false;
		timeText.visible = true;
		timeTitle.visible = true;
		newPowerUpsScreen.visible = false;
		quitScreen.visible = false;

	}

	function newPowerUps() {
		bot.x = -1111
		bot.y = -1111
		player.x = -1111
		player.y = -1111
		timeRemaining = 9999
		botLevelUnlocked = true;
		countdown.visible = false
		newPowerUpsScreen.visible = true;
		botScreen.visible = false;
		winScreen.visible = false;
		board.visible = false;
		bot.visible = false;
		player.visible = false;
		coordsText.visible = false;
		nav.visible = false;
		botWonScreen.visible = false;
		outOfTimeScreen.visible = false;
		timeText.visible = false;
		timeTitle.visible = false;
		quitScreen.visible = false;
	}

	function botUnlocked() {
		bot.x = -1111
		bot.y = -1111
		player.x = -1111
		player.y = -1111
		timeRemaining = 9999
		botLevelUnlocked = true;
		countdown.visible = false
		botScreen.visible = true;
		winScreen.visible = false;
		board.visible = false;
		bot.visible = false;
		player.visible = false;
		coordsText.visible = false;
		nav.visible = false;
		botWonScreen.visible = false;
		outOfTimeScreen.visible = false;
		timeText.visible = false;
		timeTitle.visible = false;
		newPowerUpsScreen.visible = false;
		quitScreen.visible = false;
	}

	function win() {
		timeRemaining = 9999
		winScreen.visible = true;
		countdown.visible = false
		botScreen.visible = false;
		board.visible = false;
		bot.visible = false;
		player.visible = false;
		coordsText.visible = false;
		nav.visible = false;
		botWonScreen.visible = false;
		outOfTimeScreen.visible = false;
		timeText.visible = false;
		timeTitle.visible = false;
		newPowerUpsScreen.visible = false;
    quitScreen.visible = false;
	}

	function botWon() {
		timeRemaining = 9999
		board.visible = false;
		countdown.visible = false
		bot.visible = false;
		player.visible = false;
		coordsText.visible = false;
		nav.visible = false;
		winScreen.visible = false;
		botWonScreen.visible = true;
		outOfTimeScreen.visible = false;
		timeText.visible = false;
		timeTitle.visible = false;
		newPowerUpsScreen.visible = false;
		quitScreen.visible = false;
	}

	function outOfTime() {
		timeRemaining = 9999
		countdown.visible = false
		botFromTime.visible = botLevelUnlocked? true : false
		outOfTimeScreen.visible = true;
		board.visible = false;
		bot.visible = false;
		player.visible = false;
		nav.visible = false;
		timeText.visible = false;
		timeTitle.visible = false;
		coordsText.visible = false;
		newPowerUpsScreen.visible = false;
		quitScreen.visible = false;
  }
  
	function quit() {
		timeRemaining = 9999
		quitScreen.visible = true
		countdown.visible = false
		botFromQuit.visible = botLevelUnlocked? true : false
		outOfTimeScreen.visible = false;
		board.visible = false;
		bot.visible = false;
		player.visible = false;
		nav.visible = false;
		timeText.visible = false;
		timeTitle.visible = false;
		coordsText.visible = false;
		newPowerUpsScreen.visible = false;
	}

	let replaySoloButton = () => {
		return createButton(gameWidth/2, 800, 'replaySolo.png', ()=>{
		useBot = false
		state = setup
		})
	}

	let replayBotButton = () => {
		return createButton(gameWidth/2, 900, 'replayBot.png', ()=>{
		useBot = true
		state = setup
		})
	}

	let quitMazeButton = () => {
		return createButton(gameWidth/2, 700, 'exitMazeButton.png', ()=>{
		window.location="create-maze"
		})
	}

	let newPowerUpsButton = () => {
		return createButton(gameWidth/2, 900, 'replayBot.png', ()=>{
		useBot = true
		state = newPowerUps
		})
	}


	let goButton = () => {
		return createButton(gameWidth/2, 925, 'goButton.png', ()=>{
		useBot = true
		state = setup
		})
	}

	// let menuButton = () => {
	// 	return createButton(75, 893, 'menuButton.png', ()=>{
	// 	//state = menu
	// 	window.location = "create-maze"
	// 	})
	// }
	//board.addChild(menuButton())

	let quitButton = () => {
		return createButton(75, 893, 'quitButton.png', ()=>{
		state = quit
		})
	}
	board.addChild(quitButton())


	// out of time screen
	let outOfTimeScreen = createGameScreen(app, gameHeight, gameWidth, "Time's up!", 0xff7118, 'hourGlassYellow.png', 1.25)
	let soloFromTime = replaySoloButton()
	let botFromTime = replayBotButton()
	outOfTimeScreen.addChild(soloFromTime)
	outOfTimeScreen.addChild(botFromTime)

  // intro to new powerups screen
  let newPowerUpsScreen = createPowerUpsScreen(app, gameHeight, gameWidth, "New power ups!", 0x000556, 'sword.png', .75, 'Weapon\nPick it up and attack the bot!', 'slowDown.png', .4, 'Bubble Gum\nSlows down the bot')
  let botFromNewPowerUps = goButton()
  newPowerUpsScreen.addChild(botFromNewPowerUps)


	// completion screen
	let winScreen = createGameScreen(app, gameHeight, gameWidth, 'Maze complete!')
	winScreen.addChild(replaySoloButton())
	winScreen.addChild(replayBotButton())


	// unlocked bot screen
	let botScreen = createGameScreen(app, gameHeight, gameWidth, "Unlocked\n~ Bot Mode ~", 0x19cdff)
	botScreen.addChild(replaySoloButton())
	botScreen.addChild(newPowerUpsButton())


  // bot won screen
  let botWonScreen = createGameScreen(app, gameHeight, gameWidth, "Beat by the bot!", 0xa8a8a8, 'botShield.png', .4)
  botWonScreen.addChild(replaySoloButton())
	botWonScreen.addChild(replayBotButton())

  // quit screen
	let quitScreen = createGameScreen(app, gameHeight, gameWidth, "", 0x00b5a2, 'quitButton.png', 2)
	let botFromQuit = replayBotButton()
  quitScreen.addChild(replaySoloButton())
	quitScreen.addChild(botFromQuit)
	quitScreen.addChild(quitMazeButton())


	app.ticker.add(() => {
		if (timeRemaining > 0) {

		timeRemaining -= 1/60
		timeText.text = Math.round(timeRemaining)
		}
		else {
			state = outOfTime
		}
	})

	app.stage.addChild(winScreen)
	app.stage.addChild(botScreen)
	app.stage.addChild(outOfTimeScreen)
	app.stage.addChild(botWonScreen)
	app.stage.addChild(newPowerUpsScreen)
	app.stage.addChild(quitScreen)

	// Add board tiles. Currently set to transparent
	let tiles = new PIXI.Graphics()
	tiles.alpha = 0

	for (let row = 0; row < maze[0].length; row++) {
		for (let col = 0; col < maze.length; col++) {
			// draw a rectangle
			tiles.beginFill(mazeGrid[col][row] ? blockedColor : clearColor)
			tiles.drawRoundedRect(
				row * tileSize,
				col * tileSize,
				tileSize,
				tileSize,
				10
			)
		}
	}
	board.addChild(tiles)

	board.x = 0
	board.y = 0
	app.stage.addChild(board)

	// Keyboard navigation

	//Capture the keyboard arrow keys
	let leftKey = keyboardTracker(37),
		upKey = keyboardTracker(38),
		rightKey = keyboardTracker(39),
		downKey = keyboardTracker(40)

	// arrow key movement
	let frames = 0
	app.ticker.add(() => {
		frames++
		if (frames % 4 === 0) {
			if (leftKey.isDown) move.left(player, mazeGrid, tileSize)
			if (rightKey.isDown) move.right(player, mazeGrid, tileSize)
			if (upKey.isDown) move.up(player, mazeGrid, tileSize)
			if (downKey.isDown) move.down(player, mazeGrid, tileSize)
		}
	})
	// nav button movement
	app.ticker.add(() => {
		if (currentPlayerDirection && frames % 4 === 0)
			currentPlayerDirection(player, mazeGrid, tileSize)
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
	let nav = new PIXI.Container()

	// draw a rectangle for right button
	let right = new PIXI.Graphics()
	right.lineStyle(2, 0xf0ead6, 1)
	right.beginFill(0x494845)
	right.drawRoundedRect(180, 45, 90, 90, 10)
	// Opt-in to interactivity, show hand curser normalize touch and mouse
	right.interactive = true
	right.buttonMode = true
	right.on('pointerdown', () => (currentPlayerDirection = move.right))
	right.on('pointerup', () => (currentPlayerDirection = null))
	// add button to nav container
	nav.addChild(right)

	// draw a rectangle for left button
	let left = new PIXI.Graphics()
	left.lineStyle(2, 0xf0ead6, 1)
	left.beginFill(0x494845)
	left.drawRoundedRect(0, 45, 90, 90, 10)
	// Opt-in to interactivity, show hand curser normalize touch and mouse
	left.interactive = true
	left.buttonMode = true
	left.on('pointerdown', () => (currentPlayerDirection = move.left))
	left.on('pointerup', () => (currentPlayerDirection = null)) // add button to nav container
	nav.addChild(left)

	// draw a rectangle for up button
	let up = new PIXI.Graphics()
	up.lineStyle(2, 0xf0ead6, 1)
	up.beginFill(0x494845)
	up.drawRoundedRect(90, 0, 90, 90, 10)
	// Opt-in to interactivity, show hand curser normalize touch and mouse
	up.interactive = true
	up.buttonMode = true
	up.on('pointerdown', () => (currentPlayerDirection = move.up))
	up.on('pointerup', () => (currentPlayerDirection = null)) // add button to nav container
	nav.addChild(up)

	// draw a rectangle for down button
	let down = new PIXI.Graphics()
	down.beginFill(0x494845)
	down.lineStyle(2, 0xf0ead6, 1)
	down.drawRoundedRect(90, 90, 90, 90, 10)
	// Opt-in to interactivity, show hand curser normalize touch and mouse
	down.interactive = true
	down.buttonMode = true
	down.on('pointerdown', () => (currentPlayerDirection = move.down))
	down.on('pointerup', () => (currentPlayerDirection = null))
	// add button to nav container
	nav.addChild(down)

	nav.x = 150
	nav.y = 805
	app.stage.addChild(nav)

	// record player.x and player.y
	let coordsText = new PIXI.Text(
		'X: '+player.x+'\nY: '+player.y,
		{fill:0xf9f9f7}
	);
	coordsText.x = 10;
	coordsText.y = 810;

	// record time remaining
		let timeText = new PIXI.Text(
			Math.round(timeRemaining),
			{fill:0xf9f9f7, fontSize: '100px', fontWeight: "bold", align: "center"}
		);
		timeText.x = 570;
		timeText.y = 918;
		timeText.anchor.set(1, .5)
		app.stage.addChild(timeText);

		let timeTitle = new PIXI.Text(
			'Time left:',
			{fill:0xf9f9f7, fontSize: '30px', fontWeight: "bold", align: "center"}
		);
		timeTitle.x = 580;
		timeTitle.y = 823;
		timeTitle.anchor.set(1, 0)
		app.stage.addChild(timeTitle);

	// update coordinates and check if reached target
	app.ticker.add(async function() {
		coordsText.text = 'X: ' + player.x + '\nY: ' + player.y
    // check if player reached target
    const { id, solvable } = mazeInstance
		if (overlapping(player, mazeTarget, tileSize)) {
        state = botLevelUnlocked? win : botUnlocked
        let request = {
          seconds: (timeAllowed - timeRemaining),
          playerId: user.id,
          mazeId: id
        }
        await axios.post('api/plays/', request)
        if(!solvable) {
          await axios.put(`api/mazes/${id}`)
        }
		}

		// check if bot reached target
		else if (overlapping(bot, mazeTarget, tileSize)) {
			bot.x = startX
			bot.y = startY
			state = botWon
		}
	})

	// check if extra time should be activated
	app.ticker.add(function() {
		if (extraTime && overlapping(player, extraTime, tileSize)) {
			timeRemaining += 10
			extraTime.destroy()
			extraTime = null
		}
	})

	// check if bomb should be activated
	app.ticker.add(function() {
		if (bomb && overlapping(player, bomb, tileSize)) {
			{
				player.x = startX
				player.y = startY
				bomb.destroy()
				bomb = null
			}
		}
		if (bomb && overlapping(bot, bomb, tileSize)) {
			{
				bot.x = startX
				bot.y = startY
				bomb.destroy()
				bomb = null
			}
		}
	})

	// show countdown for last five seconds
	app.ticker.add(function() {
		if (timeRemaining <= 5 && timeRemaining > 0) {
			countdown.visible = true
			countdownText.text = Math.round(timeRemaining)
		}
	})

	// prepare freeze overlay
	let countdown = createOverlay(app, gameHeight, gameWidth, 0xff7c02)
	let countdownText = new PIXI.Text(5, { fill: 0xf9f9f7, fontSize: '300px' })
	countdownText.x = 200
	countdownText.y = 250
	countdown.addChild(countdownText)

	// prepare freeze overlay
	let freezeOverlay = createOverlay(app, gameHeight, gameWidth, 0xf9f9f7)
	let freezeText = new PIXI.Text(5, { fill: 0xf9f9f7, fontSize: '300px' })
	freezeText.x = 200
	freezeText.y = 250
	freezeOverlay.addChild(freezeText)

	// check if freeze should be activated
	let frozenPlayer
	let frozenBot
	let freezeCount = 180
	let freezeBot = false
	let freezePlayer = false
	app.ticker.add(function() {
  let frozenPlayerX = null
  let frozenPlayerY = null
  let frozenBotX = null
  let frozenBotY = null
  // if (freeze && overlapping(bot, freeze, tileSize) && !freezeBot) {
  // 	freezeBot = true
  // }
  // if (freezeBot && freezeCount) {
  // 	freezeCount--
  // 	const currentFreezeBotX = bot.x
  // 	const currentFreezeBotY = bot.y
  // 	const oldFreezeBot = bot

  // 	bot = wallFollowerBot(app, board, mazeGrid, tileSize, currentFreezeBotX, currentFreezeBotY, endX, endY, 9999)
  // 	oldFreezeBot.x = -111
  // 	oldFreezeBot.y = -111

  // }
  // if (freezeBot && !freezeCount) {
  // 	freezeBot = false
  // 	freezeOverlay.visible = false
  // 	const currentUnFreezeBotX = bot.x
  // 	const currentUnFreezeBotY = bot.y
  // 	const oldUnFreezeBot = bot
  // 	freeze.destroy()
  // 	freeze = null

  // 	bot = wallFollowerBot(app, board, mazeGrid, tileSize, currentUnFreezeBotX, currentUnFreezeBotY, endX, endY, 2)
  // 	oldUnFreezeBot.x = -111
  // 	oldUnFreezeBot.y = -111
  // } else

		if (freeze && overlapping(player, freeze, tileSize) && !freezePlayer) {
		freezePlayer = true
		frozenPlayerX = player.x
		frozenPlayerY = player.y
		frozenPlayer = createSprite('shield.png', frozenPlayerX, frozenPlayerY, 0.2)
		freeze.x = frozenPlayer.x
		freeze.y = frozenPlayer.y

		board.addChild(frozenPlayer)

		player.x = -888
		player.y = -888
	}
	if (freezePlayer && freezeCount) {
		freezeCount--
		freeze.scale.x *= 1.002
		freeze.scale.y *= 1.002
	}
	if (freezePlayer && !freezeCount) {
		player.x =frozenPlayer.x
		player.y = frozenPlayer.y
		freezePlayer = false
		frozenPlayer.destroy()
		freeze.destroy()
		freeze = null
	}
		else if (freeze && overlapping(bot, freeze, tileSize) && !freezeBot) {
		freezeBot = true
		frozenBotX = bot.x
		frozenBotY = bot.y
		frozenBot = createSprite('botShield.png', frozenBotX, frozenBotY, 0.05)
		freeze.x = frozenBot.x
		freeze.y = frozenBot.y

		board.addChild(frozenBot)

		bot.x = -111
		bot.y = -111
	}
	if (freezeBot && freezeCount) {
		freezeCount--
		freeze.scale.x *= 1.002
		freeze.scale.y *= 1.002
	}
	if (freezeBot && !freezeCount) {
		bot.x = frozenBot.x
		bot.y = frozenBot.y
		freezeBot = false
		frozenBot.destroy()
		freeze.destroy()
		freeze = null
	}
})
	// check if weapon should be activated
	let weaponGrabbed = false
	app.ticker.add(function() {
		if (!weaponGrabbed) {
			if (weapon && overlapping(player, weapon, tileSize)) {
				weaponGrabbed = true
			}
		} else {
			weapon.x = player.x + tileSize * 1.5
			weapon.y = player.y
			if (overlapping(player, bot, tileSize)) {
				bot.x = startX
				bot.y = startY
				weaponGrabbed = false
				weapon.destroy()
				weapon = null
			}
		}
	}
)

  // check if slowDown should be activated
  app.ticker.add(function() {
    if (slowDown && overlapping(bot, slowDown, tileSize))
    {
      const currentBotX = bot.x
      const currentBotY = bot.y
      const oldBot = bot
      bot = wallFollowerBot(app, board, mazeGrid, tileSize, currentBotX, currentBotY, endX, endY, 1)
      oldBot.x = -111
      oldBot.y = -111
      slowDown.destroy()
      slowDown = null
    }
  })

	// check if teleport should be used
	if (tele.x >= 0 && tele.y >= 0 && port.x >= 0 && port.y >= 0) {
		activateTeleport(
			app,
			player,
			tele,
			port,
			tileSize,
			mazeWidth,
			mazeHeight,
			mazeGrid
		) // activate for player
		activateTeleport(
			app,
			bot,
			tele,
			port,
			tileSize,
			mazeWidth,
			mazeHeight,
			mazeGrid
		) // activate for bot
	}
	return app
}

export default createBoard
