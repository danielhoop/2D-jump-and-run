import * as ws from "ws";

import {
    SocketDataEnum,
    SocketData
} from "./types";

interface IdentifiableSocket {
    id: string,
    socket: any
}

const port = 8000;
const server = new ws.Server({ port: port });

const sockets: Array<IdentifiableSocket> = [];

server.on("connection", function (socket) {

    // Send the user his/her id.
    const userId = "1" + Math.floor(Math.random() * 1000000000000);
    const msg: SocketData = {
        type: SocketDataEnum.userId,
        broadcast: true,
        payload: userId
    }
    socket.send(JSON.stringify(msg));

    // Add the socket together with id to array.
    sockets.push({
        id: userId,
        socket: socket
    });

    // On close, remove socket from array.
    socket.on("close", function() {
        for (let i = 0; i < sockets.length; i++) {
            if (sockets[i].id === userId) {
                sockets.splice(i, 1);
            }
        }
    });
    
    // On message...
    // When it is a broadcast, forward to all registered sockets,
    // Otherwise forward only to the recipients.
    socket.on("message", function (dat) {
        const txt: string = dat.toString();
        const data: SocketData = JSON.parse(txt);
        // console.log(data);

        for (let i = 0; i < sockets.length; i++) {
            if (data.broadcast) {
                sockets[i].socket.send(txt);
            } else {
                // This code is not yet tested.
                if (data.recipients) {
                    for (let j = 0; j < data.recipients.length; j++) {
                        if (sockets[i].id === data.recipients[j]) {
                            sockets[i].socket.send(txt);
                        }
                    }
                }
            }
        }
    });
    
    console.log("Connection established to user: " + userId);
});

console.log("Server is running.");
console.log("Listening to port: " + port);