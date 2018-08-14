import * as PIXI from 'pixi.js'
import keyboardTracker from './keyboardTracker'


const createBoard = (img, maze) => {
console.log('maze', maze)
var app = new PIXI.Application(800, 600, { antialias: true, backgroundColor: 0x001099bb })

var background = PIXI.Sprite.fromImage(img)
background.anchor.x = 0
background.anchor.y = 0
background.position.x = 0
background.position.y = 0

// var mazeGrid = [
//   [0,0,0,0,0],
//   [1,1,1,1,0],
//   [0,0,0,0,0],
//   [0,1,1,1,1],
//   [0,0,0,0,0],
//   ]
var mazeGrid = maze

var clearColor = 0xf7f8f9
var blockedColor = 0x494845
var tileSize = 10 // in pixels

var board = new PIXI.Graphics()
board.addChild(background)


var tiles = new PIXI.Graphics()
tiles.alpha = 0


for (var row = 0; row < 50; row++){
  for (var col = 0; col < 50; col++){
	// draw a rectangle
    tiles.beginFill(mazeGrid[col][row] ? blockedColor : clearColor);
	tiles.drawRect(row*tileSize, col*tileSize, tileSize, tileSize);
  }
}
board.addChild(tiles)

board.x = 200
board.y = 50
app.stage.addChild(board);

// Keyboard navigation

//Capture the keyboard arrow keys
let leftKey = keyboardTracker(37),
		upKey = keyboardTracker(38),
		rightKey = keyboardTracker(39),
		downKey = keyboardTracker(40)

app.ticker.add(()=>{
	if (leftKey.isDown) moveLeft()
	if (rightKey.isDown) moveRight()
	if (upKey.isDown) moveUp()
	if (downKey.isDown) moveDown()
})

leftKey.press = () => {
	console.log('down?', leftKey.isUp)
	moveLeft()
}

rightKey.press = () => {
	moveRight()
}

upKey.press = () => {
	moveUp()
}

downKey.press = () => {
	moveDown()
}


// navigation buttons
var nav = new PIXI.Container();


// draw a rectangle for right button
var right = new PIXI.Graphics();
right.lineStyle(5, 0x494845, 1);
right.beginFill(0xffd900);
right.drawRect(100,20,50,50);
// Opt-in to interactivity, show hand curser normalize touch and mouse
right.interactive = true;
right.buttonMode = true;
right.on('pointerdown', moveRight);
// add button to nav container
nav.addChild(right)


// draw a rectangle for left button
var left = new PIXI.Graphics();
left.lineStyle(5, 0x494845, 1);
left.beginFill(0xffd900);
left.drawRect(0,20,50,50);
// Opt-in to interactivity, show hand curser normalize touch and mouse
left.interactive = true;
left.buttonMode = true;
left.on('pointerdown', moveLeft);
// add button to nav container
nav.addChild(left)


// draw a rectangle for up button
var up = new PIXI.Graphics();
up.lineStyle(5, 0x494845, 1);
up.beginFill(0xffd900);
up.drawRect(50,0,50,50);

// Opt-in to interactivity, show hand curser normalize touch and mouse
up.interactive = true;
up.buttonMode = true;
up.on('pointerdown', moveUp);
// add button to nav container
nav.addChild(up)

// draw a rectangle for down button
var down = new PIXI.Graphics();
down.beginFill(0xffd900);
down.lineStyle(5, 0x494845, 1);
down.drawRect(50,50,50,50);
// Opt-in to interactivity, show hand curser normalize touch and mouse
down.interactive = true;
down.buttonMode = true;
down.on('pointerdown', moveDown);
// add button to nav container
nav.addChild(down)


nav.x = 5
nav.y = 5
app.stage.addChild(nav);


// create a new Sprite from an image path
var bunny = PIXI.Sprite.fromImage('shield.png')

// center the sprite's anchor point
bunny.anchor.set(0.5);

// move the sprite to the start of the maE
bunny.x = 0;
bunny.y = 0;

// make bunny bigger
bunny.scale.x = 0.1
bunny.scale.y = 0.1

board.addChild(bunny);

// function to check if a move is blocked
function moveBlocked(x,y){
  var underZero = x < 0 || y < 0
  var overGridLength = (
    x > (mazeGrid.length*tileSize)-1 || y > (mazeGrid[0].length*tileSize)-1
  )
  if (!underZero && !overGridLength) var isBlocked = mazeGrid[(y/tileSize)][(x/tileSize)]
  return underZero || overGridLength || isBlocked

}

// create movement functions activated by click
var desiredX = bunny.x
var desiredY = bunny.y

function moveRight() {
  desiredX = bunny.x+tileSize
  desiredY = bunny.y
  if (!moveBlocked(desiredX, desiredY)) bunny.x+=tileSize
}
function moveLeft() {
   desiredX = bunny.x-tileSize
  desiredY = bunny.y
  if (!moveBlocked(desiredX, desiredY)) bunny.x-=tileSize
}
function moveUp() {
  desiredX = bunny.x
  desiredY = bunny.y-tileSize
  if (!moveBlocked(desiredX, desiredY)) bunny.y-=tileSize
}
function moveDown() {
  desiredX = bunny.x
  desiredY = bunny.y+tileSize
  if (!moveBlocked(desiredX, desiredY)) bunny.y+=tileSize
}

// record bunny.x and bunny.y
var basicText = new PIXI.Text(
  'bunny X: '+bunny.x+'\nbunny Y: '+bunny.y,
  {fill:0xf9f9f7}
);
basicText.x = 30;
basicText.y = 150;
app.stage.addChild(basicText);

app.ticker.add(function() {
	basicText.text = 'bunny X: '+bunny.x+'\nbunny Y: '+bunny.y
  targetText.text = 'Completed:\n'+ reachedTarget(bunny, mazeTarget)

})

// check if bunny has reached the target
var mazeTarget = {row: 50, col: 50}

function reachedTarget(sprite, target){
  const targetY = target.row * tileSize - tileSize
  const targetX = target.col * tileSize - tileSize
  return sprite.x === targetX && sprite.y === targetY
}

// text to say whether bunny has reached target
var targetText = new PIXI.Text(
  'Completed:\n'+ reachedTarget(bunny, mazeTarget),
  {fill:0xf9f9f7}
);
targetText.x = 30
targetText.y = 400
app.stage.addChild(targetText)

return app
}

export default createBoard
