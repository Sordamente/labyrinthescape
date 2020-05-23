function initializePeer() {
    peer = new Peer(prefix + myID);
    connectedToServer = false;

    peer.on('open', function (id) { connectedToServer = true; });

    connectionHost();
}

function connectionHost() {
    peer.on('connection', function (conn) {
        isHost = true;
        allConnections.push(conn);

        conn.send('veryspecialtrash');
        conn.on('data', function (data) {

            let splitData = data.split(",");
            if (splitData[0] == 'pos') {
                playerPos[conn.peer].position.x = +splitData[1];
                playerPos[conn.peer].position.y = +splitData[2];
            } else if (splitData[0] == 'name') {
                idToName[conn.peer] = splitData[1];
                menu.state = "CLIENTMODE";
                menu.eventHandler("CREATE PARTY");

                conn.send("name," + (prefix + myID) + "," + idToName[prefix + myID]);
                for (let c in allConnections) {

                    if (allConnections[c].peer != conn.peer) {
                        conn.send("name," + allConnections[c].peer + "," + idToName[allConnections[c].peer]);
                        allConnections[c].send("name," + conn.peer + "," + idToName[conn.peer]);
                    }
                }
            }
        });

        let otherPlayer = genObj(0, 0, scale / 2, scale / 2, gameColors.player);
        playerPos[conn.peer] = otherPlayer;

        menu.state = "CLIENTMODE";
        menu.eventHandler("CREATE PARTY");
    });
}

function sendPositionData() {
    if (!isHost && allConnections.length == 1) {
        if (allConnections[0] && allConnections[0].open) {
            allConnections[0].send('pos,' + player.position.x + ',' + player.position.y);
        }
    } else if (isHost) {
        for (let c in allConnections) {
            if (allConnections[c] && allConnections[c].open) {
                allConnections[c].send('pos,' + peer.id + ',' + player.position.x + ',' + player.position.y);
                for (let c2 in allConnections) {
                    if (allConnections[c2] && allConnections[c2].open && allConnections[c] != allConnections[c2]) {
                        let peerID = allConnections[c2].peer;
                        allConnections[c].send('pos,' + peerID + ',' + playerPos[peerID].position.x + ',' + playerPos[peerID].position.y);
                    }
                }
            }
        }
    }
}

function sendStartInfo() {
    for (let c in allConnections) {
        if (allConnections[c] && allConnections[c].open) {
            allConnections[c].send('id,' + peer.id);
            for (let c2 in allConnections) {
                if (allConnections[c2] && allConnections[c2].open && allConnections[c] != allConnections[c2]) {
                    allConnections[c].send('id,' + allConnections[c2].peer);
                }
            }
            allConnections[c].send('start,' + mazeSeed);
        }
    }
}