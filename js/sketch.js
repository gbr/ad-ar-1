// Global variables for audio analysis
let song; // The music track
let amplitude; // To measure the amplitude of the song
let fft; // To analyze the frequency spectrum
let bgImg;

function preload() {
  bgImg = loadImage(
    "https://accd-ats-sp23.s3.us-west-1.amazonaws.com/john-cage-half.png"
  );
  song = loadSound(
    "https://accd-ats-sp23.s3.us-west-1.amazonaws.com/cage-1-cut-1.mp3"
  );
}

function setup() {
  // background(255);
  createCanvas(895, 1280, document.getElementById("canvas-ar"));
  pixelDensity(1);
  stroke(255);
  fill(255);

  // Start playing the song
  song.play();

  // Create a new Amplitude analyzer
  amplitude = new p5.Amplitude();

  // Optionally, create a FFT analyzer if you want to use frequency data
  fft = new p5.FFT();

  // Resize the image without distorting proportions
  let imgAspectRatio = bgImg.width / bgImg.height;
  let canvasAspectRatio = width / height;

  if (imgAspectRatio > canvasAspectRatio) {
    // Image is wider than canvas
    let h = height;
    let w = imgAspectRatio * h;
    bgImg.resize(w, h);
  } else {
    // Image is taller than canvas
    let w = width;
    let h = w / imgAspectRatio;
    bgImg.resize(w, h);
  }

  // Optionally crop the image if it's larger than the canvas
  bgImg = bgImg.get(
    (bgImg.width - width) / 2,
    (bgImg.height - height) / 2,
    width,
    height
  );
}

// Global variable to store the previous frame's dot positions for smoothing
let prevDotYPositions = [];

function draw() {
  background(bgImg);
  // background(255);
  let numberOfSets = 5; // Total number of sets
  let linesPerSet = 5; // Lines per set
  let spacingBetweenLines = 20; // Vertical spacing between lines
  let spacingBetweenSets = 120; // Vertical spacing between sets
  let dotSpacing = 30; // Horizontal spacing between dots
  let dotOffset = dotSpacing / 2; // Horizontal offset for dots on odd lines
  let initialX = 0; // Horizontal start position for the first dot
  let initialY = 200; // Vertical start position for the first line
  stroke(255);
  strokeWeight(1);
  fill(255);

  // Get the amplitude level of the song
  let level = amplitude.getLevel();
  let smoothedLevel = smoothLevel(level);

  // Get the frequency spectrum for dot displacement
  let waveform = fft.waveform();

  for (let set = 0; set < numberOfSets; set++) {
    let setY =
      initialY + set * (linesPerSet * spacingBetweenLines + spacingBetweenSets);

    // Initialize the array for storing dot positions if necessary
    if (prevDotYPositions.length < numberOfSets) {
      prevDotYPositions[set] = [];
    }

    for (let lineNo = 0; lineNo < linesPerSet; lineNo++) {
      let y = setY + lineNo * spacingBetweenLines;

      // If we're drawing a set with dots
      if (set % 2 == 1) {
        // Draw static lines for sets with dots
        line(initialX, y, width - initialX, y);

        // Draw dots following the waveform pattern
        for (let x = initialX; x < width - initialX; x += dotSpacing) {
          let dotX = x + (lineNo % 2 == 0 ? 0 : dotOffset);
          let index = Math.floor(
            map(x, initialX, width - initialX, 0, waveform.length)
          );
          let yOffset = waveform[index] * 50; // Scale it appropriately
          ellipse(dotX, y + yOffset, 7, 7); // Draw the dot with waveform offset
        }
      } else {
        push();
        noFill();
        beginShape();
        for (let x = initialX; x < width - initialX; x++) {
          // Use the waveform data to offset the y position of each vertex
          let index = Math.floor(
            map(x, initialX, width - initialX, 0, waveform.length)
          );
          let yOffset = waveform[index] * 50; // Scale it appropriately
          vertex(x, y + yOffset);
        }
        endShape();
        pop();
      }
    }
  }
}

// Function to smooth the level values over time
function smoothLevel(level) {
  let smoothingFactor = 0.8; // Determines how much smoothing is applied
  let smoothedValue = level;
  if (prevLevel !== undefined) {
    smoothedValue = lerp(prevLevel, level, smoothingFactor);
  }
  prevLevel = smoothedValue; // Store the smoothed value for the next frame
  return smoothedValue;
}

// Global variable to store the previous level for smoothing
let prevLevel;

function mouseClicked() {
  if (song.isPlaying()) {
    // .isPlaying() returns a boolean
    song.pause(); // .play() will resume from .pause() position
    noLoop();
  } else {
    song.play();
    loop();
  }
}
