let dstimg;

let objects = [];

let video;
let poseNet;
let pose;

//R channel of the color under 13 pixels of the heart
let r = 255;

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.hide();
  
  pixelDensity(1);
  dstimg = createImage(640,480);
  
  // Hook up poseNet
  poseNet = ml5.poseNet(video, modelLoaded);
  poseNet.on('pose', gotPoses);
}

function gotPoses(poses) {
  //console.log(poses);
  if (poses.length > 0) {
    pose = poses[0].pose;
  }
}

function modelLoaded() {
  console.log('poseNet ready');
}

function draw() {

  image(video, 0, 0,640, 480);
  
  if (pose) {
    print(pose);
    let eyeR = pose.rightEye;
    let eyeL = pose.leftEye;
    let d = dist(eyeR.x, eyeR.y, eyeL.x, eyeL.y);
    print(d);
    
    if(d<35 | d>45){
      image(dstimg,0,0,640,480);
      blur();
    }
    
    if(d<45 & d>35){
      image(dstimg, 0, 0,640, 480);
      edgeDetect();
      
     let WheCreate=round(random(4));
     if(WheCreate==1){
         objects.push(new heartObj());
     }
      
      for(let i = 0;i<objects.length;i++){
        objects[i].display();
        objects[i].move();
      }

    }
  }
  //updateHeartPos();
  // drawObjects();

}

function edgeDetect(){
    // Y-Direction Kernel
	var k2 = [[-2, -4, -2],
		      [0, 0, 0],
	          [2, 4, 2]];
	
	video.loadPixels();
    dstimg.loadPixels();
	
	var w = 640;
	var h = 480;
	for (var x = 0; x < w; x++) {
    	for (var y = 0; y < h; y++) {
		
			// INDEX POSITION IN PIXEL LIST
			var ul = ((x-1+w)%w + w*((y-1+h)%h))*4; // location of the UPPER LEFT
			var uc = ((x-0+w)%w + w*((y-1+h)%h))*4; // location of the UPPER MID
			var ur = ((x+1+w)%w + w*((y-1+h)%h))*4; // location of the UPPER RIGHT
			var ml = ((x-1+w)%w + w*((y+0+h)%h))*4; // location of the LEFT
			var mc = ((x-0+w)%w + w*((y+0+h)%h))*4; // location of the CENTER PIXEL
			var mr = ((x+1+w)%w + w*((y+0+h)%h))*4; // location of the RIGHT
			var ll = ((x-1+w)%w + w*((y+1+h)%h))*4; // location of the LOWER LEFT
			var lc = ((x-0+w)%w + w*((y+1+h)%h))*4; // location of the LOWER MID
			var lr = ((x+1+w)%w + w*((y+1+h)%h))*4; // location of the LOWER RIGHT

			// RGB channels
			var p0 = video.pixels[ul]*k2[0][0]+video.pixels[ul+1]*k2[0][0]+video.pixels[ul+2]*k2[0][0]; // upper left
			var p1 = video.pixels[uc]*k2[0][1]+video.pixels[uc+1]*k2[0][1]+video.pixels[uc+2]*k2[0][1]; // upper mid
			var p2 = video.pixels[ur]*k2[0][2]+video.pixels[ur+1]*k2[0][2]+video.pixels[ur+2]*k2[0][2]; // upper right
			var p3 = video.pixels[ml]*k2[1][0]+video.pixels[ml+1]*k2[1][0]+video.pixels[ml+2]*k2[1][0]; // left
			var p4 = video.pixels[mc]*k2[1][1]+video.pixels[mc+1]*k2[1][1]+video.pixels[mc+2]*k2[1][1]; // center pixel
			var p5 = video.pixels[mr]*k2[1][2]+video.pixels[mr+1]*k2[1][2]+video.pixels[mr+2]*k2[1][2]; // right
			var p6 = video.pixels[ll]*k2[2][0]+video.pixels[ll+1]*k2[2][0]+video.pixels[ll+2]*k2[2][0]; // lower left
			var p7 = video.pixels[lc]*k2[2][1]+video.pixels[lc+1]*k2[2][1]+video.pixels[lc+2]*k2[2][1]; // lower mid
			var p8 = video.pixels[lr]*k2[2][2]+video.pixels[lr+1]*k2[2][2]+video.pixels[lr+2]*k2[2][2]; // lower right
			var r1 = (p0+p1+p2+p3+p4+p5+p6+p7+p8)/3;

			// -1000 is the minimum value the sum could result in and 1000 is the maximum
			var result = map(r1, -1000, 1000, 0, 255);
			
			// write pixels into destination image:
			dstimg.pixels[mc] = result; 
			dstimg.pixels[mc+1] = result; 
			dstimg.pixels[mc+2] = result; 
			dstimg.pixels[mc+3] = 255; 	
    	}
  	}	
  
    for (var i = 0; i < w; i++) {
    	for (var j = 0; j < h; j++) {
            var index = (i+j*width)*4;
            if(dstimg.pixels[index]>120){
              dstimg.pixels[index] = random(220,255);
              dstimg.pixels[index+1] = random(220,255);
              dstimg.pixels[index+2] = random(220,255);
            }
        }
    }  
	// update and display the pixel buffer
	dstimg.updatePixels();
  
}

function blur () {
      video.loadPixels();
      dstimg.loadPixels();
      for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
          boxBlur(x, y);
        }
      }
      dstimg.updatePixels();
}
function getIndex (x, y) {
  return (x + y * width)*4;
}

function boxBlur (x, y) {
  let avgR = 0;
  let avgG = 0;
  let avgB = 0;
  let pixelsSeen = 0;
// Go through each neighborly pixel.
for (let dx = -1; dx < random(4,8); dx++) {
    for (let dy = -1; dy < random(4,8); dy++) {
      let index = getIndex(x + dx, y + dy);
      // If we're off the pixel array, ignore it!
      if (index < 0 || index > video.pixels.length) {
        continue;
      }
      
      let r = video.pixels[index+0];
      let g = video.pixels[index+1];
      let b = video.pixels[index+2];
      
      avgR += r;
      avgG += g;
      avgB += b;
      
      pixelsSeen += 1;
    }
  }
  
  avgR /= pixelsSeen;
  avgG /= pixelsSeen;
  avgB /= pixelsSeen;
  
  let trueIndex = getIndex(x, y);
  
  dstimg.pixels[trueIndex] = avgR+20;
  dstimg.pixels[trueIndex + 1] = avgG-10;
  dstimg.pixels[trueIndex + 2] = avgB-10;
}

class heartObj{
  constructor(){
    this.x = round(random(40,600));
    this.y = round(random(0,10));
    //this.index = (this.x + (this.y+14) * width)*4;
  }
  
  move(){
    
    r = dstimg.pixels[(this.x + (this.y+14) * width)*4];
    print(r);
    //print(this.index);

    if(r>200){
      this.y+= 10;
    }
    
    if(this.y>height-40){
      this.y = 0;
    }
  }

  display(){
    noStroke();
    fill(220,160,160);
    triangle(this.x, this.y, this.x-5,this.y-7, this.x-10, this.y);
    triangle(this.x, this.y, this.x+5,this.y-7, this.x+10, this.y);
    triangle(this.x, this.y+13, this.x-10,this.y, this.x+10, this.y);
  }
}