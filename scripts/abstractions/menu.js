class Menu {
    constructor() {
        this.state = "CLIENTMODE";
        this.currentMenu = new MenuOptions(...mainMenu, [idToName[myID]]);
    }

    eventHandler(data) {
        if (!data) return;

        if (this.state == "CLIENTMODE") {

            if (data == "CREATE PARTY") {
                this.state = "CREATEPARTY";
                this.currentMenu = new MenuOptions("ID: " + myID + ", " + (allConnections.length + 1) + "P", "share this id with those you want in your party", [
                    "READY TO START",
                    "BACK"
                ], ["PARTY MEMBERS:"].concat(Object.values(idToName)));
            } else if (data == "JOIN PARTY") {
                this.state = "JOINPARTY";
                this.currentMenu = new MenuPrompt("JOIN PARTY", "ask your party leader for the party id", "ENTER PARTY ID", myID.length);
            } else if (data == "SET NAME") {
                this.state = "SETNAME";
                this.currentMenu = new MenuPrompt("SET NAME", "choose a name that will be visible to all players", "ENTER USERNAME", 15);
            }

        } else if (this.state == "CREATEPARTY") {

            if (data == "READY TO START") {
                mazeSeed = Date.now();
                sendStartInfo();
                game = new Game();
                gameState = "GAME";
            } else {
                this.state = "CLIENTMODE";
                this.currentMenu = new MenuOptions(...mainMenu, [idToName[myID]]);
            }

        } else if (this.state == "JOINPARTY") {
            for (let c in allConnections)
                if (allConnections[c]) allConnections[c].close();

            let conn = peer.connect(data);

            this.state = "HANDSHAKING";
            this.currentMenu = new MenuAlert('Connecting to the Party', 'please hold until the line picks up on the other side', []);

            conn.on('open', () => {
                allConnections.push(conn);

                conn.on('data', (data) => {
                    if (data == "starthandshake") {
                        this.state = "WAITROOM";
                        this.currentMenu = new MenuAlert('Room Joined', 'ask the host to start the game once all players are in',
                            ["PARTY MEMBERS:"].concat(Object.values(idToName)));

                        conn.send("confirmhandshake");
                        conn.send('name,' + idToName[myID]);
                    }

                    let splitData = data.split(",");

                    switch (splitData[0]) {
                        case 'start':
                            mazeSeed = +splitData[1];
                            monster = playerPos[splitData[2]];
                            isMonster = player == monster;
                            game = new Game();
                            gameState = "GAME";
                            break;
                        case 'pos':
                            let pID = splitData[1];
                            playerPos[pID].position.x = +splitData[2];
                            playerPos[pID].position.y = +splitData[3];
                            break;
                        case 'name':
                            idToName[splitData[1]] = splitData[2];

                            this.state = "WAITROOM";
                            this.currentMenu = new MenuAlert('Room Joined', 'ask the host to start the game once all players are in',
                                ["PARTY MEMBERS:"].concat(Object.values(idToName)));

                            let otherPlayer = genObj(0, 0, scale / 2, scale / 2, gameColors.player);
                            playerPos[splitData[1]] = otherPlayer;
                            break;
                        case 'die':
                            playerPos[splitData[1]].visible = false;
                            deadPlayers.push(playerPos[splitData[1]]);
                            break;
                        case 'poweruppicked':
                            powerupsInUse.push(+splitData[1]);
                            powerups[+splitData[1]].sprite.visible = false;
                            break;
                        case 'powerupdropped':
                            let powerupID = +splitData[1];
                            for (let p in powerupsInUse) {
                                if (powerupsInUse[p] == powerupID) {
                                    powerupsInUse.splice(p, 1);
                                }
                            }

                            powerups[powerupID].sprite.visible = true;
                            powerups[powerupID].sprite.position.x = +splitData[2];
                            powerups[powerupID].sprite.position.y = +splitData[3];
                            powerups[powerupID].sprite.velocity.x = +splitData[4];
                            powerups[powerupID].sprite.velocity.y = +splitData[5];

                            // last arguments will be powerup specific
                            if (['Boot', 'Torch'].includes(powerups[powerupID].constructor.name)) {
                                powerups[powerupID].timeAvailable = +splitData[6];
                            }
                            break;
                        case 'comp':
                            someoneCompleted(splitData[1]);
                            break;
                        case 'nextmaze':
                            game.newMaze();
                            newAlert("MAZE FINISHED, NEXT LEVEL STARTED");
                            break;
                        case 'playerwin':
                            gameState = "MENU";
                            menu.state = "GAMEOVER";
                            menu.currentMenu = new MenuOptions(...(!isMonster ? winMenu : loseMenu), ["PARTY MEMBERS:"].concat(Object.values(idToName)));
                            break;
                        case 'monsterwin':
                            gameState = "MENU";
                            menu.state = "GAMEOVER";
                            menu.currentMenu = new MenuOptions(...(isMonster ? winMenu : loseMenu), ["PARTY MEMBERS:"].concat(Object.values(idToName)));
                            break;
                    }
                });
            });
        } else if (this.state == "SETNAME") {
            idToName[myID] = data;
            this.state = "CLIENTMODE";
            this.currentMenu = new MenuOptions(...mainMenu, [idToName[myID]]);
        } else if (this.state == "GAMEOVER") {
            resetGame();
        }
    }

    handleKey(code, key) {
        this.eventHandler(this.currentMenu.handleKey(code, key));
    }

    draw() {
        this.currentMenu.draw();
    }
}

class MenuAlert {
    constructor(header, subtitle, upperText) {
        this.header = header;
        this.subtitle = subtitle;
        this.upperText = upperText;
    }

    handleKey() { }

    draw() {
        drawBasicMenu(this.header, this.subtitle);

        textAlign(LEFT, TOP);
        textSize(48);
        for (let i = 0; i < this.upperText.length; i++) {
            text(this.upperText[i], uiPadding, uiPadding + 48 * i);
        }
    }
}

class MenuPrompt {
    constructor(header, subtitle, placeholder, maxLength) {
        this.header = header;
        this.subtitle = subtitle;
        this.placeholder = placeholder;
        this.input = "";
        this.maxLength = maxLength;
        this.maxBackspaceDelay = 15;
        this.backspaceDelay = this.maxBackspaceDelay;
    }

    handleKey(code, key) {
        if (code == 8 && this.input != "") {
            this.input = this.input.substring(0, this.input.length - 1);
            this.backspaceDelay = this.maxBackspaceDelay;
        }

        if (code == 13) return this.input;

        if (validCharacters.includes(key) && this.input.length < this.maxLength) this.input += key;
        return 0;
    }

    draw() {
        if (keyIsDown(8)) {
            this.backspaceDelay--;
            if (this.backspaceDelay < 0) {
                this.backspaceDelay = 1;
                this.input = this.input.substring(0, this.input.length - 1);
            }
        }

        drawBasicMenu(this.header, this.subtitle);

        const bottom = windowHeight;
        const right = windowWidth;

        textAlign(RIGHT, BOTTOM);
        textSize(64);
        if (this.input == "") {
            fill(140);
            text(this.placeholder, right - uiPadding, bottom - uiPadding);
        } else {
            text(this.input, right - uiPadding, bottom - uiPadding);
        }
    }
}

class MenuOptions {
    constructor(header, subtitle, options, upperText, enterHandler) {
        this.header = header;
        this.subtitle = subtitle;
        this.options = options;
        this.currentOption = 0;
        this.upperText = upperText;
        this.enterHandler = enterHandler;
    }

    handleKey(code, key) {
        switch (code) {
            case 87: //W
                this.currentOption++;
                this.currentOption %= this.options.length;
                return 0;
            case 83: //S
                this.currentOption--;
                if (this.currentOption < 0) this.currentOption = this.options.length - 1;
                return 0;
            case 13: //ENTER
                return this.options[this.currentOption];
        }
    }

    draw() {
        drawBasicMenu(this.header, this.subtitle);
        const bottom = windowHeight;
        const right = windowWidth;

        textAlign(RIGHT, BOTTOM);
        textSize(64);
        for (let i = 0; i < this.options.length; i++) {
            text((i == this.currentOption ? "> " : "") + this.options[i], right - uiPadding, bottom - uiPadding - 64 * i);
        }

        textAlign(LEFT, TOP);
        textSize(48);
        for (let i = 0; i < this.upperText.length; i++) {
            text(this.upperText[i], uiPadding, uiPadding + 48 * i);
        }
    }
}