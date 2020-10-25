import * as ws from "ws";
import * as _ from "lodash";

import {
    SocketEvent,
    SocketData,
    constants,
    UserData
} from "./types";

interface UserDataAndSocket {
    user: UserData,
    socket: any
}

// --- Attributes ---
const port = 8000;
const server = new ws.Server({ port: port });

const userDataList: Record<string, UserDataAndSocket> = {};
const rooms: Record<string, Array<string>> = {
    [constants.LOBBY]: []
};
const groups: Record<string, Array<string>> = {
    [constants.GROUP_0]: []
};

// --- Functions ---
const sendBroadcast = function (txt: string): void {
    Object.keys(userDataList).forEach((key: string) => {
        if (userDataList[key]) {
            userDataList[key].socket.send(txt);
        }
    });
}

const sendToRecipients = function (txt: string, recipientIds: Array<string>): void {
    recipientIds.forEach((userId) => {
        if (userDataList[userId]) {
            userDataList[userId].socket.send(txt);
        }
    })
}

const sendToRoom = function (txt: string, roomId: string) {
    rooms[roomId].forEach((userId) => {
        if (userDataList[userId]) {
            userDataList[userId].socket.send(txt);
        }
    })
}

// Not type safe because TypeScript definition file for WebSocket is erroneous.
/*const sendUserUpdateMsg = function (userData: UserData, socket: WebSocket) {
    const msg: SocketData = {
        type: SocketDataEnum.USER_DATA,
        payload: userData
    }
    socket.send(JSON.stringify(msg));
}*/

const deleteUserFromRoom = function (userId: string, roomId: string): void {
    if (roomId && rooms[roomId]) {
        rooms[roomId] = _.difference(rooms[roomId], [userId]);
        if (rooms[roomId].length == 0 && roomId != constants.LOBBY) {
            delete rooms[roomId];
        }
    }
}

const deleteUserFromGroup = function (userId: string, groupId: string): void {
    if (groupId && groups[groupId]) {
        groups[groupId] = _.difference(groups[groupId], [userId]);
    }
}

// If roomId is null, then nothing will happen! It is always necessary to stay in a room.
const moveUserToRoom = function (userId: string, roomId: string) {
    if (roomId) {
        deleteUserFromRoom(userId, userDataList[userId].user.roomId);
        userDataList[userId].user.roomId = roomId;
        if (!rooms[roomId]) {
            rooms[roomId] = [];
        }
        rooms[roomId].push(userId);
    }
}

// If groupId is null, then the user will be gone from all groups.
const moveUserToGroup = function (userId: string, groupId: string) {
    deleteUserFromGroup(userId, userDataList[userId].user.groupId);
    if (groupId) {
        userDataList[userId].user.groupId = groupId;
        if (!groups[groupId]) {
            groups[groupId] = [];
        }
        groups[groupId].push(userId);
    }
}

// Server / socket functionality
server.on("connection", function (socket) {

    // Send the user his/her id, room & group.
    const userId = "1" + Math.floor(Math.random() * 1000000000000);
    const initialUserData: UserData = {
        name: "unknown",
        userId: userId,
        roomId: constants.LOBBY,
        groupId: constants.GROUP_0
    }

    const msg: SocketData = {
        type: SocketEvent.USER_DATA,
        payload: initialUserData
    }
    socket.send(JSON.stringify(msg));


    // Add user information to list.
    userDataList[userId] = {
        user: initialUserData,
        socket: socket
    };

    // Add the user to room and grou list
    moveUserToRoom(userId, initialUserData.roomId);
    moveUserToGroup(userId, initialUserData.groupId);

    // On socket close, remove user data from all lists.
    socket.on("close", function () {
        // Delete from room
        deleteUserFromRoom(userId, userDataList[userId].user.roomId);
        // Delete from group. The group itself is not deleted (unlike the rooms).
        deleteUserFromGroup(userId, userDataList[userId].user.groupId);
        // Delete from list with user data.
        delete userDataList[initialUserData.userId];

        console.log("User: '" + userId + "' has left.");
        console.log("Below is the list of sockets, list of rooms, list of groups.");
        console.log(userDataList);
        console.log(rooms);
        console.log(groups);
        console.log("---");
    });

    // On message...
    // When it is a broadcast, forward to all registered sockets,
    // Otherwise forward only to the recipients.
    socket.on("message", function (dat) {
        const txt: string = dat.toString();
        const msgData: SocketData = JSON.parse(txt);
        const userFromList: UserDataAndSocket = userDataList[userId];
        console.log(msgData);

        // This case is primarily to update the name of the user on the server side.
        if (msgData.type == SocketEvent.USER_DATA) {
            const uData: UserData = msgData.payload;
            if (userId == uData.userId) {
                userDataList[userId].user.name = uData.name;
                moveUserToRoom(userId, uData.roomId);
                moveUserToGroup(userId, uData.groupId);
            }
        }

        // Here, a user tells all other users that he/she changes groups.
        if (msgData.type == SocketEvent.USER_CHANGES_GROUP) {
            const uData: UserData = msgData.payload;
            moveUserToGroup(userId, uData.groupId);
        }

        // Take all members of a group and put them into a new room.
        if (msgData.type == SocketEvent.START_GAME) {
            const uData: UserData = msgData.payload;
            if (uData.groupId == constants.GROUP_0 || userFromList.user.groupId == constants.GROUP_0) {
                return;
            }
            const newRoomId: string = "2" + Math.floor(Math.random() * 1000000000000);
            const usersInGroup: Array<string> = _.clone(groups[userDataList[userId].user.groupId])
            usersInGroup.forEach(userId => {
                deleteUserFromGroup(userId, userDataList[userId].user.groupId);
                moveUserToRoom(userId, newRoomId);
            });

            console.log("Rooms and groups:");
            console.log(rooms);
            console.log(groups);
        }

        console.log("Below is the list of sockets, list of rooms, list of groups.");
        console.log(userDataList);
        console.log(rooms);
        console.log(groups);
        console.log("---");

        if (msgData.broadcast) {
            sendBroadcast(txt);
            return;
        }

        if (msgData.recipientIds) {
            sendToRecipients(txt, msgData.recipientIds);
            return;
        }

        if (msgData.roomId) {
            sendToRoom(txt, msgData.roomId);
            return;
        }

    });

    console.log("Connection established to user: " + userId);
});

console.log("Server is running.");
console.log("Listening to port: " + port);