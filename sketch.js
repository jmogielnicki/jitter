var canvas;
var bug;  // Declare object
var bugList = [];
var anchorList = [];
var eraseAllButton;
var thingType = 'bug';
var randomSlider;
var onCanvas;
var switchModeButton;
var modeCurrent = 0;
var firstTimeSwitch = true;
var activeAnchorX = 200;
var activeAnchorY = 200;
var bugColor = [255,255,255,255]
var bugOutline = [0,0,0,0]
var backgroundTransparency = 255;
var bugSize = 1;
var bugOverallSpeed = 100;



function setup() {
  // Canvas stuffs
  canvas = createCanvas(windowWidth-100, windowHeight-120);
  canvas.parent('canvasContainer');
  canvas.mouseOver(function() { onCanvas = true; });
  canvas.mouseOut( function() { onCanvas = false; });

  // Create object
  bug = new Jitter();

  // Make cursor disappear when in canvas
  noCursor();

  // Create the buttons
  createButtons();

  // Create the sliders
  randomSlider = createSlider(1, 1000, 500);
  randomSlider.parent('sliders');
  randomSlider.html('randomness');

  sizeSlider = createSlider(1, 50, 1)
  sizeSlider.parent('sliders');
  sizeSlider.html('size');
}

function draw() {
  fill(20, 20, 20, backgroundTransparency);
  rect(-1, -1, width+2, height+2);
  bugOverallSpeed = randomSlider.value()/800;
  bugSize = sizeSlider.value();

  // Just for the shape of the 
  switch(thingType) {
    case 'bug':
      fill(250,250,250,150);
      ellipse(mouseX, mouseY, 8, 8);
      break;
    case 'anchor':
      fill(0,0,0);
      ellipse(mouseX, mouseY, 25, 25);
      break;
    case 'eraser':
      fill(255,255,255);
      rectMode(CENTER);
      rect(mouseX, mouseY, 40, 40);
      break;
    case 'repulsor':
      fill(255, 255, 255, 20);
      stroke(255, 255, 255, 150)
      ellipse(mouseX, mouseY, 60, 60);
      noStroke();
      break;
  }

  // Bug creation is here, but anchor creation is in mouseClicked function to prevent multiples
  if (mouseIsPressed && onCanvas === true) {
    if (thingType === 'bug') {
      bugList.push(new Jitter());
    } 
  }
  
  for (i = 0; i < anchorList.length; i++) {
    anchor = anchorList[i];
    anchor.display();
    if  (thingType === 'eraser' && mouseIsPressed && dist(anchor.x, anchor.y, mouseX, mouseY) < 20){
      anchorList.splice(i, 1);
    }
  }

    for (i = 0; i < bugList.length; i++) {
    bug = bugList[i];
    bug.move();
    bug.display();
    if  (thingType === 'eraser' && mouseIsPressed && dist(bug.x, bug.y, mouseX, mouseY) < 20){
      bugList.splice(i, 1);
    }
  }
}


function makeButtons (text, method) {
  button = createButton(text);
  button.class('btn btn-primary btn-sm')
  button.parent('controls');
  button.mousePressed(method);
};


function createButtons() {
  
  makeButtons('Bug', function() { thingType = 'bug'; });
  makeButtons('Anchor', function() { thingType = 'anchor'; });
  makeButtons('Eraser', function() { thingType = 'eraser'; });
  makeButtons('Pusher', function() {thingType = 'repulsor'});
  makeButtons('Switch Mode', function() { changeMode();})
  makeButtons('Reset', eraseEverything);

};

function windowResized() {
  resizeCanvas(windowWidth-100, windowHeight-120);
}


function mouseClicked() {
  // Put anchor in this function so that multiples wouldn't be created
  if (thingType === 'anchor' && onCanvas === true) {
      anchorList.push(new Anchor());
  }
}

function changeMode() {
  modeCurrent++;
  if (modeCurrent > 2) {
    modeCurrent = 0;
  } 
  if (modeCurrent === 0) {
    backgroundTransparency = 255;
    bugOutline = [0, 0, 0, 0]
    bugColor = [255,255,255,230]
  } else if (modeCurrent === 1) {
    backgroundTransparency = 30;
    bugOutline = [50, 50, 50, 255]
    bugColor = [255,255,255,230]
    // fill(255, 10); // semi-transparent white
    // rect(-1, -1, width+2, height+2);
  } else if (modeCurrent === 2) {
    backgroundTransparency = 0;
    bugOutline = [50, 50, 50, 255]
    bugColor = [255,255,255,230]
    // fill(0, 100); 
    // rect(0, 0, width, height);
    }

};

function eraseEverything() {
  modeCurrent = 0;
  bugList = [];
  anchorList = [];
}

function adjustAnchor(current, adjustment, speed) {
  return (current * (1 - speed)) + (adjustment * speed)
}

function Anchor() {
  this.x = mouseX;
  this.y = mouseY;
  this.diameter = 10;
  var anchorRedFill = 0;
  var goUp = true;

  this.display = function() {

    if (anchorRedFill > 104) {
      goUp = false;
    } else if (anchorRedFill < 1) {
      goUp = true;
    }

    if (goUp === true) {
      anchorRedFill = anchorRedFill+1
    } else {
      anchorRedFill = anchorRedFill-1
    }

    fill(anchorRedFill, anchorRedFill/2, 0);
    this.diameter = (anchorRedFill/20)+25;
    noStroke();
    ellipse(this.x, this.y, this.diameter, this.diameter);
  }

}

// Jitter class
function Jitter() {
  this.xAnchorPoint = mouseX;
  this.yAnchorPoint = mouseY;
  this.x = mouseX;
  this.y = mouseY;
  this.bugRange = 200;

  this.moveTimer = random(100, 1000);

  // Temp - testing perlin noise instead of randomness
  this.perlinXStartTime = random(0,10000);
  this.perlinYStartTime = random(0,10000);

  this.bugXSpeed = random(0.005, 0.02);
  this.bugYSpeed = random(0.0005, 0.008);

  this.diameter = random(2, 5);
  var attracted = false;

  this.move = function() {

    var perlinXValue = noise(this.perlinXStartTime);
    var perlinYValue = noise(this.perlinYStartTime);
    var bugXPos = map(perlinXValue, 0, 1, this.xAnchorPoint - this.bugRange, this.xAnchorPoint + this.bugRange);
    var bugYPos = map(perlinYValue, 0, 1, this.yAnchorPoint - this.bugRange, this.yAnchorPoint + this.bugRange);

    var prevDistance = -1;
    var attracted = false;
    var mouseDistX = this.x - mouseX;
    var mouseDistY = this.y - mouseY;
    var mouseDist = dist(mouseX, mouseY, this.x, this.y);
    var mouseRepulseX = 30/mouseDistX;
    var mouseRepulseY = 30/mouseDistY;

    for (var i = 0; i < anchorList.length; i++) {
      anchor = anchorList[i];
      var currDistance = dist(this.x, this.y, anchor.x, anchor.y);
      if (prevDistance === -1 || currDistance <= prevDistance) {
        activeAnchorX = anchor.x;
        activeAnchorY = anchor.y;
        prevDistance = currDistance;
        if(currDistance<180) {
          attracted = true;
        }
      }
    }

    if(anchorList.length === 0) {
      activeAnchorX = this.x;
      activeAnchorY = this.y;
    }

    if(thingType === 'repulsor' && mouseDist < 60) {
      this.x += mouseRepulseX;
      this.y += mouseRepulseY;
    };



    if(attracted === true) {

      // Shrinks the range of bugs slowly
      this.bugRange = (this.bugRange * .99) + (150 * 0.01);

      this.xAnchorPoint = adjustAnchor(this.xAnchorPoint, activeAnchorX, 0.005);
      this.yAnchorPoint = adjustAnchor(this.yAnchorPoint, activeAnchorY, 0.005);
      this.x = bugXPos;
      this.y = bugYPos
;

    } else {

      this.x = bugXPos;
      this.y = bugYPos;
      // this.xAnchorPoint = adjustAnchor(this.xAnchorPoint, mouseX, 0.005);
      // this.yAnchorPoint = adjustAnchor(this.yAnchorPoint, mouseY, 0.005);
;
    }

    this.perlinXStartTime += this.bugXSpeed * bugOverallSpeed;
    this.perlinYStartTime += this.bugYSpeed * bugOverallSpeed;
  };

  this.display = function() {

    stroke(bugOutline);
    currentDiameter = this.diameter * bugSize;
    fill(bugColor);
    ellipse(this.x, this.y, currentDiameter, currentDiameter);

  }
};