var canvas;
var bug;  // Declare object
var bugList = [];
var anchorList = [];
var eraseAllButton;
var thingType = 'insect';
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
var bugOverallSpeed = 500;
var fireFlyMode = false;
var bugDelayCount = 0;
var soundOn = false;


function preload() {
  soundFormats('ogg', 'mp3');
  peepers = loadSound('assets/sounds/peepers.mp3');
}

function setup() {
  peepers.setVolume(0.1);
  // peepers.loop();
  // Canvas stuffs
  canvas = createCanvas(windowWidth-100, windowHeight-110);
  canvas.parent('canvasContainer');
  canvas.mouseOver(function() { onCanvas = true; });
  canvas.mouseOut( function() { onCanvas = false; });

  // Create object
  bug = new Jitter();

  cursor(CROSS);

  // Create the buttons
  createButtons();


  // Create the sliders
  randomSlider = createSlider(1, 1000, 500);
  randomSlider.parent('sliders');
  randomSlider.html('randomness');

}

function draw() {
  fill(20, 20, 20, backgroundTransparency);
  rect(-1, -1, width+2, height+2);
  bugOverallSpeed = map(randomSlider.value(), 1, 1000, 0.001, 1.5);
  soundRate = map(randomSlider.value(), 1, 1000, 0.001, 2);
  peepers.rate(soundRate);

  // Bug creation is here, but anchor creation is in mouseClicked function to prevent multiples
  if (thingType === 'insect' && onCanvas === true && (mouseIsPressed)) {
    if (bugDelayCount === 0) {
      bugList.push(new Jitter());
    }
    bugDelayCount++;
    if (bugDelayCount > 1) {
      bugDelayCount = 0;
    }
  }

  // Keeping number of bugs at 300. Using shift to remove first bug in array (which was first created)
  if (bugList.length > 400) {
    bugList.shift()
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


function makeButtons (text, classType, method, icon) {
  // debugger
  // button = createButton(text);
  if (icon) {
    var buttonInfo = icon + text;
  } else {
    var buttonInfo = text;
  }
  button = createButton(buttonInfo)
  button.class('btn btn-primary btn-sm')
  button.parent(classType);
  button.mousePressed(method);
};


function createButtons() {
  var plusIcon = "<i class='fa fa-plus'></i>"
  var soundIcon = "<i class='fa fa-lg fa-volume-off'></i>"

  makeButtons('Insect', 'items', selectMode, plusIcon);
  makeButtons('Light', 'items', selectMode, plusIcon);
  makeButtons('Eraser', 'items', selectMode);
  makeButtons('Switch Mode', 'controls', changeMode);
  makeButtons('Reset', 'controls', eraseEverything);
  makeButtons('', 'controls', toggleSound, soundIcon);

  makeBugButtonActive();
};

function selectMode() {
  removeActiveClass();
  this.addClass('active');
  thingType = this.elt.textContent.toLowerCase();
}

function removeActiveClass() {
  var currentActiveButton = $('.active');
  if (currentActiveButton.length > 0) {
    currentActiveButton.removeClass('active');
  }
}

function makeBugButtonActive() {
  removeActiveClass();
  var bugButton = $("button:contains('Insect')");
  bugButton.addClass('active');
}

function windowResized() {
  resizeCanvas(windowWidth-100, windowHeight-120);
}


function mouseClicked() {
  // Put anchor in this function so that multiples wouldn't be created
  if (thingType === 'light' && onCanvas === true) {
      anchorList.push(new Anchor());
  }
}

function toggleSound() {
  soundOn = !soundOn;
  if (soundOn) {
    var soundIcon = "<i class='fa fa-lg fa-volume-up'></i>";
    peepers.loop();
  } else {
    var soundIcon = "<i class='fa fa-lg fa-volume-off'></i>";
    peepers.stop();
  }

  button.remove();
  makeButtons('', 'controls', toggleSound, soundIcon);
}

function changeMode() {
  modeCurrent++;
  if (modeCurrent > 3) {
    modeCurrent = 0;
  }
  if (modeCurrent === 0) {
    backgroundTransparency = 255;
    bugOutline = [0, 0, 0, 0]
    bugColor = [255,255,255,255]
    fireFlyMode = false;
  } else if (modeCurrent === 2) {
    backgroundTransparency = 30;
    bugOutline = [50, 50, 50, 200]
    bugColor = [255,255,255,255]
    fireFlyMode = false;
  } else if (modeCurrent === 3) {
    backgroundTransparency = 1;
    bugOutline = [50, 50, 50, 200]
    bugColor = [255,255,255,255]
    fireFlyMode = false;
  } else if (modeCurrent === 1) {
    backgroundTransparency = 255;
    bugOutline = [0, 0, 0, 0]
    bugColor = [255,255,255,255]
    fireFlyMode = true;
  }

};

function eraseEverything() {
  bugList = [];
  anchorList = [];
  modeCurrent = 3;
  changeMode();
  thingType = 'insect';
  makeBugButtonActive();
}

function adjustAnchor(current, adjustment, speed) {
  adjustmentSpeed = speed * bugOverallSpeed;
  return (current * (1 - adjustmentSpeed)) + (adjustment * adjustmentSpeed)
}

function Anchor() {
  this.x = mouseX;
  this.y = mouseY;
  this.diameter = 10;
  var anchorRedFill = 201;
  var goUp = true;

  this.display = function() {

    if (anchorRedFill > 200) {
      goUp = false;
    } else if (anchorRedFill < 100) {
      goUp = true;
    }

    if (goUp === true) {
      anchorRedFill = anchorRedFill+1
    } else {
      anchorRedFill = anchorRedFill-1
    }



    this.diameter = (anchorRedFill/40)+1;
    noStroke();
    for (var i = 1; i < 20; i++) {
      fill(anchorRedFill/1.3, anchorRedFill/2, 0, 255/i);
      ellipse(this.x, this.y, this.diameter * i, this.diameter * i);
    }
  }
}

// Jitter class
function Jitter() {

  // AnchorPoints are whatever the current middle of the box is, targetAnchors are where we want the next middlepoint to be
  this.xAnchorPoint = mouseX;
  this.yAnchorPoint = mouseY;

  // This is meant to be a future anchorpoint that the current anchorpoint will move towards
  this.targetXAnchor = mouseX;
  this.targetYAnchor = mouseY;

  this.x = mouseX;
  this.y = mouseY;

  // Firefly settings for the bug
  this.blinkSpan = random(50, 200);
  this.blinkTimer = random(500, 2000);
  this.blinkOn = false;

  this.colored = bugColor;

  // Defines how far the bug will roam from AnchorPoints
  this.bugRange = 0;
  this.initialState = true;

  // How long do we wait when target and anchorpoint are within range before changing target, different per bug
  this.moveTimer = random(100, 1000);

  // Start each bug at a different point in time along perlin path
  this.perlinXStartTime = random(0,10000);
  this.perlinYStartTime = random(0,10000);

  // Some bugs are faster, some slower
  this.bugXSpeed = random(0.005, 0.02);
  this.bugYSpeed = random(0.0005, 0.008);

  // Some bugs bigger, some smaller
  this.diameter = random(1, 5);

  this.attracted = false;

  this.move = function() {

    var perlinXValue = noise(this.perlinXStartTime);
    var perlinYValue = noise(this.perlinYStartTime);

    if (this.bugRange < 200 && this.initialState === true) {
      this.bugRange = this.bugRange + 2;
    } else {
      this.initialState = false;
    }


    // bugXPos is the position of the bug within the box defined by xAnchorPoint/yAnchorPoint
    var bugXPos = map(perlinXValue, 0, 1, this.xAnchorPoint - this.bugRange, this.xAnchorPoint + this.bugRange);
    var bugYPos = map(perlinYValue, 0, 1, this.yAnchorPoint - this.bugRange, this.yAnchorPoint + this.bugRange);

    var prevDistance = -1;
    this.attracted = false;

    // Starting the blink
    this.blinkTimer--;
    if (this.blinkTimer * (bugList.length / 20) < 1) {
      this.blinkOn = true;
      this.blinkSpan--;
    }
    if (this.blinkSpan < 1) {
      this.blinkSpan = random(20, 100);
      this.blinkTimer = random(100, 1000);
      this.blinkOn = false;
    }

    // If the anchor and target are close, start the timer
    if (dist(this.xAnchorPoint, this.yAnchorPoint, this.targetXAnchor, this.targetYAnchor) < 5) {
      this.moveTimer--;
    }
    // When timer goes off, move the target anchor and restart the timer
    if (this.moveTimer < 1) {
      this.targetXAnchor = random(0, width);
      this.targetYAnchor = random(0, height);
      this.moveTimer = random(100, 1000);
    }

    for (var i = 0; i < anchorList.length; i++) {
      anchor = anchorList[i];
      var currDistance = dist(this.x, this.y, anchor.x, anchor.y);
      if (prevDistance === -1 || currDistance <= prevDistance) {
        activeAnchorX = anchor.x;
        activeAnchorY = anchor.y;
        prevDistance = currDistance;
        if(currDistance<180) {
          this.attracted = true;
        }
      }
    }

    if(anchorList.length === 0) {
      activeAnchorX = this.x;
      activeAnchorY = this.y;
    }



    if(this.attracted === true) {

      // Shrinks the range of bugs slowly
      this.bugRange = (this.bugRange * .99) + (150 * 0.01);

      this.targetXAnchor = activeAnchorX;
      this.targetYAnchor = activeAnchorY;
    }

    this.xAnchorPoint = adjustAnchor(this.xAnchorPoint, this.targetXAnchor, 0.005);
    this.yAnchorPoint = adjustAnchor(this.yAnchorPoint, this.targetYAnchor, 0.005);

    this.x = bugXPos;
    this.y = bugYPos;


    this.perlinXStartTime += this.bugXSpeed * bugOverallSpeed;
    this.perlinYStartTime += this.bugYSpeed * bugOverallSpeed;
  };

  this.display = function() {

    this.colored = bugColor;
    if (fireFlyMode === true) {
      if (this.blinkOn === false) {
        this.colored = [30,30,30,255];
      } else {
        this.colored = bugColor;
      }
    }


    stroke(bugOutline);
    currentDiameter = this.diameter;
    fill(this.colored);
    ellipse(this.x, this.y, currentDiameter, currentDiameter);

  }
};
