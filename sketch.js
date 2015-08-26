var mDiv;
var mCanvas, mFbo;
var mThreeJS;

var mBackgroundImage;
var mIsMouseOnDiv = false;

function setup() {
  frameRate(30);
  containerSetup();
  mFbo = createGraphics(300,300);
  
  mThreeJS = new ThreeJS(this, mDiv);
  mThreeJS.setupRenderer(width, height);
  mThreeJS.setupScene();
  //mThreeJS.loadSTLFile('data/iphone6HiRez.stl');
  //mThreeJS.loadJSONFile('data/iphone6.json');
  
  
}

function draw() {
  //p5.js
  background(100);
  tint(255);
  //image(mBackgroundImage, 0, 0, width, height);
  drawFbo();
  image(mFbo, 0, 0);
  mThreeJS.update();
  mThreeJS.draw();

}

function drawFbo() {
  mFbo.background(255);
  var pos = createVector();
  pos.x = map(sin(frameCount/100), -1, 1, 40, mFbo.width-40);
  pos.y = map(cos(frameCount/100), -1, 1, 40, mFbo.height-40);
  var rad = map(sin(frameCount/10), -1, 1, 15, 155);
  mFbo.fill(255);
  mFbo.stroke(255);
  mFbo.ellipse(pos.x, pos.y, rad, rad);
  mFbo.fill(200);
  mFbo.stroke(200);
  mFbo.ellipse(pos.x, pos.y, rad*6/8, rad*6/8);
  mFbo.fill(150);
  mFbo.stroke(150);
  mFbo.ellipse(pos.x, pos.y, rad*4/8, rad*4/8);
  mFbo.fill(70);
  mFbo.stroke(70);
  mFbo.ellipse(pos.x, pos.y, rad*2/8, rad*2/8);
  mFbo.fill(0);
  mFbo.stroke(0);
  mFbo.ellipse(pos.x, pos.y, rad*1/8, rad*1/8);
  
}

function keyTyped() {
 if (key === 'c' || key==='C') {
   mThreeJS.switchControls();
 }
 else if (key === 't' || key==='T') {
   mThreeJS.setTransformControlsMode("translate");
 }
 else if (key === 'r' || key==='R') {
   mThreeJS.setTransformControlsMode("rotate");
 }
 else if (key === 's' || key==='S') {
   mThreeJS.setTransformControlsMode("scale");
 }
 else if (key === 'e' || key==='E') {
   //mThreeJS.exportJSON();
   //mThreeJS.exportBinarySTL("iphone.stl");
   mThreeJS.exportSTL("iphone");
 }
  //   if (!mIsButtonVisible) {
  //     mChangeButton.show();
  //     mIsButtonVisible = true;
  //   } else {
  //     mChangeButton.hide();
  //     mIsButtonVisible = false;
  //   }
  // }
}

function containerSetup() {
  mDiv = createDiv("");
  //mDiv = getElement(id);
  mDiv.mouseOut(function(){ mIsMouseOnDiv = false;});
  mDiv.mouseOver(function(){ mIsMouseOnDiv = true;});
  mDiv.elt.style.width = "100%";
  mDiv.elt.style.height = "100%";
  mDiv.elt.style.position = "absolute";
  mDiv.elt.style.left = "0";
  mDiv.elt.style.top = "0";
  var w = mDiv.elt.offsetWidth;
  var h = mDiv.elt.offsetHeight;
  mCanvas = createCanvas(w, h);
  mCanvas.parent(mDiv);
  mCanvas.elt.style.zIndex = "0";
  mCanvas.elt.style.backgroundColor = "transparent";
  mCanvas.elt.style.position = "absolute";
  mCanvas.elt.style.left = "0";
  mCanvas.elt.style.top = "0";
  smooth();
}

function windowResized() {
  console.log(mDiv.elt.width);
  var w = mDiv.elt.offsetWidth;
  var h = mDiv.elt.offsetHeight;
  mThreeJS.resizeRenderer(w, h);
  mCanvas.size(w, h);
}