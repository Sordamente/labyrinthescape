function preload() {
    font = loadFont('assets/data-latin.ttf');
}

function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);
    frameRate(desiredFPS);
    game = new Game();
}

function draw() {
    if (inStartScreen) {
        background(gameColors.power);
        noStroke();
        textFont(font);
        textAlign(CENTER, CENTER);
        fill(0);
        textSize(64);
        text('YOUR PEER ID IS: ', 0, scale - height / 2);
        text('QWERTYUIOP', 0, 1.5 * scale - height / 2);

        rectMode(CENTER);

        fill(gameColors.start);
        rect(0, 2.5 * scale - height / 2, scale * 3, scale / 2);
        fill(0);
        textSize(32);
        text('CONNECT TO OTHER', 0, 2.5 * scale - height / 2);

        fill(gameColors.start);
        rect(0, 3.5 * scale - height / 2, scale * 3, scale / 2);
        fill(0);
        textSize(32);
        text('START', 0, 3.5 * scale - height / 2);
    } else {
        game.draw();
    }
}

function mouseReleased() {
    let currMouseX = mouseX - width / 2;
    let currMouseY = mouseY - height / 2;
    if ((currMouseX >= -scale * 1.5 && currMouseX <= scale * 1.5) &&
        (currMouseY >= 2.25 * scale - height / 2 && currMouseY <= 2.75 * scale - height / 2)) {
        connectToOtherID();
    }

    if ((currMouseX >= -scale * 1.5 && currMouseX <= scale * 1.5) &&
        (currMouseY >= 3.25 * scale - height / 2 && currMouseY <= 3.75 * scale - height / 2)) {
        startMaze();
    }
}

function connectToOtherID() {
    connectID = prompt("What ID are you trying to connect to?");
    // do stuff
    console.log(connectID);
}

function startMaze() {
    // figure out stuff
    if (connectID != null)
        inStartScreen = false;
}
