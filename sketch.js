var canvas;
var bug;  // Declare object
var bugList = [];
var anchorList = [];
var drawButton;
var eraseAllButton;
var anchorButton;
var randomSlider;
var eraser = false;
var anchorOn = false;
var onCanvas;
var randomness = 100;
var switchModeButton;
var modeCurrent = 0;
var firstTimeSwitch = true;
var activeAnchorX = 200;
var activeAnchorY = 200;


function setup() {
  canvas = createCanvas(800, 500);
  canvas.parent('canvasContainer');
  canvas.mouseOver(function() { onCanvas = true; });
  canvas.mouseOut( function() { onCanvas = false; });
  // Create object
  bug = new Jitter();
  randomSlider = createSlider(1, 1000, 200);
  randomSlider.parent('controls');
  randomSlider.html("test");
  anchorButton = createButton("Set Anchor");
  anchorButton.parent('controls');
  anchorButton.mousePressed(function() { anchorOn = true; });
  switchModeButton = createButton("Switch Mode");
  switchModeButton.parent('controls');
  switchModeButton.mousePressed(function() { modeCurrent++; });
  eraseAllButton = createButton("Reset");
  eraseAllButton.parent('controls');
  eraseAllButton.mousePressed(eraseEverything)
  drawButton = createButton("Eraser");
  drawButton.parent('controls');
  drawButton.mousePressed(
    function() { 
    if (eraser === false) {
      drawButton.html('Bubbler');
      cursor(HAND);
    } else {
      drawButton.html('Eraser');
    }

    eraser = !eraser;

  });
  // canvas.position(100,100);
}

function draw() {
  changeMode();
  randomness = randomSlider.value();
  if (eraser === false && anchorOn === false && mouseIsPressed && onCanvas === true) {
    bugList.push(new Jitter());
  } else if (eraser === false && anchorOn === true && mouseIsPressed && onCanvas === true) {
    anchorList.push(new Anchor());
  }
  for (i = 0; i < bugList.length; i++) {
    bug = bugList[i];
    bug.move();
    bug.display();
    if  (eraser === true && mouseIsPressed && dist(bug.x, bug.y, mouseX, mouseY) < 10){
      bugList.splice(i, 1);
    }
  }
  for (i = 0; i < anchorList.length; i++) {
    anchor = anchorList[i];
    anchor.display();
    if  (eraser === true && mouseIsPressed && dist(anchor.x, anchor.y, mouseX, mouseY) < 10){
      anchorList.splice(i, 1);
    }
  }
}

function changeMode() {
  if (modeCurrent > 2) {
    modeCurrent = 0;
    firstTimeSwitch = true;
  } else if (modeCurrent === 0) {
    background(50, 89, 100);
  } else if (modeCurrent === 1) {
    fill(255, 10); // semi-transparent white
    rect(-1, -1, width+2, height+2);
  } else if (modeCurrent === 2) {
    if (firstTimeSwitch === true) {
      background(255,255,255);
      firstTimeSwitch = false;
    }
    noStroke();
    fill(255, 10); 
    rect(0, 0, width, height);

    fill(0,100,255, 10); 
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
  this.diameter = 50;
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
    this.diameter = (anchorRedFill/20)+30;
    ellipse(this.x, this.y, this.diameter, this.diameter);
  }

}

// Jitter class
function Jitter() {
  this.x = mouseX;
  this.y = mouseY;
  this.diameter = random(10, 30);
  var attracted = false;


  this.move = function() {
    var moveRandomness = randomness*abs(randomGaussian());
    var moveRandomness = randomness*abs(randomGaussian());
    var prevDistance = -1;
    var attracted = false;
    // print(anchorList.length); 
    for (var i = 0; i < anchorList.length; i++) {
      anchor = anchorList[i];
      var currDistance = dist(this.x, this.y, anchor.x, anchor.y);
      if (prevDistance === -1 || currDistance <= prevDistance) {
        activeAnchorX = anchor.x;
        activeAnchorY = anchor.y;
        prevDistance = currDistance;
        if(currDistance<200) {
          attracted = true;
        }
      }
    }
    if(anchorList.length === 0) {
      activeAnchorX = this.x;
      activeAnchorY = this.y;
    }

    if (attracted === true) {
      this.x = (this.x*200 + ((activeAnchorX)) + (random(-moveRandomness, moveRandomness)*100))/(301);
      this.y = (this.y*200 + ((activeAnchorY)) + (random(-moveRandomness, moveRandomness)*100))/(301);
    } else {
      this.x = (this.x*100 + random(-moveRandomness, moveRandomness))/(100);
      this.y = (this.y*100 + random(-moveRandomness, moveRandomness))/(100);
    }


  };

  this.display = function() {
    // this.diameter = this.diameter + random(-randomness/100, randomness/100);
    ellipse(this.x, this.y, this.diameter, this.diameter);

  }
};