function preload() {
    font = loadFont('assets/mozart.ttf');
}

function setup() {
    allPlayers = new Group();
    peer = new Peer(prefix + myID);

    createCanvas(windowWidth, windowHeight, WEBGL);
    frameRate(desiredFPS);

    menu = new Menu();

    peer.on('connection', function (conn) {
        isHost = true;
        conn.send('trash data');
        conn.on('data', function (data) {
            let splitData = data.split(",");
            if (splitData[0] == "PLAYER POSITION DATA") {
                playerPos[conn.peer].position.x = +splitData[1];
                playerPos[conn.peer].position.y = +splitData[2];
            }
        });

        let otherPlayer = genObj(200, 200, scale / 2, scale / 2, gameColors.player);
        playerPos[conn.peer] = otherPlayer;

        console.log(allPlayers)
        allConnections.push(conn);
        console.log("PARTY CREATE SIDE Connected to " + conn.peer)

        // HACK TO GET THE PLAYER COUNT TO UPDATE PROPERLY
        menu.state = "CLIENTMODE";
        menu.eventHandler("CREATE PARTY");
    });
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function draw() {

    switch (gameState) {
        case "MENU":
            menu.draw();
            break;
        case "GAME":
            game.draw();
            break;
    }
}

function keyPressed() {
    switch (gameState) {
        case "MENU":
            menu.handleKey(keyCode, key);
    }

    return false;
}
