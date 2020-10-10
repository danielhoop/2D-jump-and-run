import * as ws from "ws";
import * as _ from "lodash";

import {
    SocketDataEnum,
    SocketData,
    constants,
    UserData
} from "./types";

interface IdentifiableSocket {
    userId: string,
    socket: any
}

const port = 8000;
const server = new ws.Server({ port: port });

const sockets: Record<string, IdentifiableSocket> = {};
const rooms: Record<string, Array<string>> = {
    [constants.LOBBY]: []
};
const groups: Record<string, Array<string>> = {
    [constants.GROUP_0]: []
};

server.on("connection", function (socket) {

    // Send the user his/her id, room & group.
    const userId = "1" + Math.floor(Math.random() * 1000000000000);
    const roomId = constants.LOBBY;
    const groupId = constants.GROUP_0;
    const userData: UserData = {
        userId: userId,
        roomId: roomId,
        groupId: groupId
    }
    const msg: SocketData = {
        type: SocketDataEnum.USER_DATA,
        payload: userData
    }
    socket.send(JSON.stringify(msg));

    // Add the socket together with id to all other sockets.
    sockets[userId] = {
        userId: userId,
        socket: socket
    };

    // Add the user to the default room
    rooms[constants.LOBBY].push(userId);

    // On close, remove socket from array.
    socket.on("close", function () {
        // Delete from list of sockets
        delete sockets[userId];
        // Delete from room
        if (rooms[userData.roomId]) {
            rooms[userData.roomId] = _.difference(rooms[userData.roomId], [userData.userId]);
            if (rooms[userData.roomId].length == 0 && userData.roomId != constants.LOBBY) {
                delete rooms[userData.roomId];
            }
        }
        // Delete from group. The group itself is not deleted (unlike the rooms).
        if (groups[userData.groupId]) {
            groups[userData.groupId] = _.difference(groups[userData.groupId], [userData.userId]);
        }
        console.log("User: '" + userId + "' has left. Room id was: '" + userData.roomId + "'");
        console.log("Below is the list of sockets, list of rooms, list of groups.");
        console.log(sockets);
        console.log(rooms);
    });

    // On message...
    // When it is a broadcast, forward to all registered sockets,
    // Otherwise forward only to the recipients.
    socket.on("message", function (dat) {
        const txt: string = dat.toString();
        const data: SocketData = JSON.parse(txt);
        // console.log(data);

        if (data.broadcast) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            Object.keys(sockets).forEach((key: string) => {
                if (sockets[key]) {
                    sockets[key].socket.send(txt);
                }
            });
            return;
        }

        if (data.recipientIds) {
            data.recipientIds.forEach((userId) => {
                if (sockets[userId]) {
                    sockets[userId].socket.send(txt);
                }
            })
            return;
        }

        if (data.roomId) {
            rooms[data.roomId].forEach((userId) => {
                if (sockets[userId]) {
                    sockets[userId].socket.send(txt);
                }
            })
        }

    });

    console.log("Connection established to user: " + userId);
});

console.log("Server is running.");
console.log("Listening to port: " + port);