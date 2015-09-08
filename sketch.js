var canvas;
var bug;  // Declare object
var bugList = [];
var anchorList = [];
var eraseAllButton;
var thingType = 'bug';
var randomSlider;
var onCanvas;
var randomness = 1;
var switchModeButton;
var modeCurrent = 0;
var firstTimeSwitch = true;
var activeAnchorX = 200;
var activeAnchorY = 200;
var bugColor = [255,255,255,255]
var bugOutline = [0,0,0,0]
var bugSize = 1;



function setup() {
  canvas = createCanvas(windowWidth-100, windowHeight-100);
  canvas.parent('canvasContainer');
  canvas.mouseOver(function() { onCanvas = true; });
  canvas.mouseOut( function() { onCanvas = false; });
  // Create object
  bug = new Jitter();
  noCursor();

  createButtons();

  randomSlider = createSlider(1, 1000, 500);
  randomSlider.parent('sliders');
  randomSlider.html('randomness');

  sizeSlider = createSlider(1, 50, 1)
  sizeSlider.parent('sliders');
  sizeSlider.html('size');
  
  noStroke();
  // canvas.position(100,100);
}

function draw() {
  changeMode();
  randomness = randomSlider.value()/100;
  bugSize = sizeSlider.value();

  // Just for the shape of the 
  switch(thingType) {
    case 'bug':
      fill(250,250,250, 150);
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
  button.class('btn btn-default')
  button.parent('controls');
  button.mousePressed(method);
};


function createButtons() {
  
  makeButtons('Bug', function() { thingType = 'bug'; });
  makeButtons('Anchor', function() { thingType = 'anchor'; });
  makeButtons('Eraser', function() { thingType = 'eraser'; });
  makeButtons('Pusher', function() {thingType = 'repulsor'});
  makeButtons('Switch Mode', function() { modeCurrent++; })
  makeButtons('Reset', eraseEverything);

};

function windowResized() {
  resizeCanvas(windowWidth-100, windowHeight-100);
}


function mouseClicked() {
  // Put anchor in this function so that multiples wouldn't be created
  if (thingType === 'anchor' && onCanvas === true) {
      anchorList.push(new Anchor());
  }
}

function changeMode() {
  if (modeCurrent > 2) {
    modeCurrent = 0;
    firstTimeSwitch = true;
  } else if (modeCurrent === 0) {
    background(40, 40, 40);
    bugOutline = [0, 0, 0, 0]
    bugColor = [255,255,255,230]
  } else if (modeCurrent === 1) {
    fill(255, 10); // semi-transparent white
    bugOutline = [0, 0, 0, 255]
    rect(-1, -1, width+2, height+2);
  } else if (modeCurrent === 2) {
    if (firstTimeSwitch === true) {
      background(255,255,255);
      bugOutline = [0, 0, 255, 200]
      firstTimeSwitch = false;
    }

    noStroke();
    fill(255, 3); 
    rect(0, 0, width, height);

    bugColor = [0,100,255,150]; 

  }
};

function eraseEverything() {
  modeCurrent = 0;
  bugList = [];
  anchorList = [];
}

function Anchor() {
  this.x = mouseX;
  this.y = mouseY;
  this.diameter = 10;
  var anchorRedFill = 154;
  var goUp = true;

  this.display = function() {

    if (anchorRedFill > 154) {
      goUp = false;
    } else if (anchorRedFill < 1) {
      goUp = true;
    }

    if (goUp === true) {
      anchorRedFill = anchorRedFill+3
    } else {
      anchorRedFill = anchorRedFill-3
    }

    fill(anchorRedFill, 0, 0);
    this.diameter = (anchorRedFill/20)+25;
    ellipse(this.x, this.y, this.diameter, this.diameter);
  }

}

// Jitter class
function Jitter() {
  this.x = mouseX;
  this.y = mouseY;
  this.diameter = random(2, 5);
  var attracted = false;

  this.move = function() {
    var moveRandomness = randomness*abs(randomGaussian());
    var moveRandomness = randomness*abs(randomGaussian());
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
        if(currDistance<300) {
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
      this.x += (random(-moveRandomness, moveRandomness)*.995) + ((activeAnchorX-this.x) * 0.005);
      this.y += (random(-moveRandomness, moveRandomness)*.995) + ((activeAnchorY-this.y) * 0.005);
    } else {
      this.x += random(-moveRandomness, moveRandomness);
      this.y += random(-moveRandomness, moveRandomness);
    }
  };

  this.display = function() {
    // this.diameter = this.diameter + random(-randomness/100, randomness/100);
    stroke(bugOutline);
    currentDiameter = this.diameter * bugSize;
    fill(bugColor);
    ellipse(this.x, this.y, currentDiameter, currentDiameter);

  }
};