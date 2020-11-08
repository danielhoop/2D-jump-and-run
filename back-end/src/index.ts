import * as ws from "ws";
import * as _ from "lodash";

import {
    SocketEvent,
    SocketData,
    constants,
    UserData,
    GameStartData
} from "./types";
import { createMap, mapLevelMetaData } from "./MapCreator";
import { MapData } from "./MapTypes";

interface UserDataAndSocket {
    user: UserData,
    socket: any
}

interface RoomData {
    userIds: Array<string>, // uid
    level: number,
    playersAtEndOfMap: Array<string>,
    scores: Record<string, Array<number>> // For each uid, 1 array. For each map, 1 place in the array.
}
const createEmptyRoom = function (): RoomData {
    return {
        userIds: [],
        level: 0,
        playersAtEndOfMap: [],
        scores: {}
    }
}

// --- Attributes ---
const PORT = 8000;
const SERVER = new ws.Server({ port: PORT });

const userDataList: Record<string, UserDataAndSocket> = {};
const rooms: Record<string, RoomData> = {
    [constants.LOBBY]: createEmptyRoom()
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
    rooms[roomId].userIds.forEach((userId) => {
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

const deleteUserFromRoom = function (userData: UserData, sendToAll: boolean): void {
    const { userId } = userData;
    const roomId = userDataList[userId].user.roomId;
    if (roomId && rooms[roomId]) {
        rooms[roomId].userIds = _.difference(rooms[roomId].userIds, [userId]);
        if (rooms[roomId].userIds.length == 0 && roomId != constants.LOBBY) {
            delete rooms[roomId];
        }
    }
    if (sendToAll) {
        userData.roomId = undefined;
        sendGoupOrRoomChangeToAll(userData);
    }
}

const deleteUserFromGroup = function (userData: UserData, sendToAll: boolean): void {
    const { userId } = userData;
    const groupId = userDataList[userId].user.groupId;
    if (groupId && groups[groupId]) {
        groups[groupId] = _.difference(groups[groupId], [userId]);
    }
    if (sendToAll) {
        userData.groupId = undefined;
        sendGoupOrRoomChangeToAll(userData);
    }
}

const moveUserToRoom = function (userData: UserData, sendToAll: boolean) {
    const { userId, roomId } = userData;
    deleteUserFromRoom(userData, false); // Do not broadcast.
    if (roomId) {
        userDataList[userId].user.roomId = roomId;
        if (!rooms[roomId]) {
            rooms[roomId] = createEmptyRoom();
        }
        rooms[roomId].userIds.push(userId);
    }
    if (sendToAll) {
        sendGoupOrRoomChangeToAll(userData);
    }
}

const moveUserToGroup = function (userData: UserData, sendToAll: boolean) {
    const { userId, groupId } = userData;
    // If the group is already full, then do not move the player to that group.
    if (groupId && groupId != constants.GROUP_0 && groups[groupId] && groups[groupId].length == constants.MAX_ROOM_SIZE) {
        return;
    }
    // If groupId is null, then the user will be gone from all groups.
    deleteUserFromGroup(userData, false); // Do not broadcast.
    if (groupId) {
        userDataList[userId].user.groupId = groupId;
        if (!groups[groupId]) {
            groups[groupId] = [];
        }
        groups[groupId].push(userId);
    }
    if (sendToAll) {
        sendGoupOrRoomChangeToAll(userData);
    }
}

const sendGoupOrRoomChangeToAll = function (userData: UserData) {
    const msg: SocketData = {
        type: SocketEvent.USER_CHANGES_GROUP,
        payload: userData
    }
    sendBroadcast(JSON.stringify(msg));
}

// Server / socket functionality
SERVER.on("connection", function (socket) {

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

    // Add the user to room and group list
    moveUserToRoom(initialUserData, false);
    moveUserToGroup(initialUserData, false);

    // On socket close, remove user data from all lists.
    socket.on("close", function () {
        // Delete from room
        deleteUserFromRoom(initialUserData, true);
        // Delete from group. The group itself is not deleted (unlike the rooms).
        deleteUserFromGroup(initialUserData, true);
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
        console.log("on message, userId: " + userId);
        const txt: string = dat.toString();
        const msgData: SocketData = JSON.parse(txt);
        const userFromList: UserDataAndSocket = userDataList[userId];
        console.log(msgData);

        // This case is primarily to update the name of the user on the server side.
        // Happens, when user has chosen a username.
        if (msgData.type == SocketEvent.USER_DATA) {
            const uData: UserData = msgData.payload;
            if (userId == uData.userId) {
                userDataList[userId].user.name = uData.name;
                moveUserToRoom(uData, true);
                moveUserToGroup(uData, true);
            }
            return;
        }

        // Here, a user tells all other users that he/she changes groups.
        if (msgData.type == SocketEvent.USER_CHANGES_GROUP) {
            const uData: UserData = msgData.payload;
            moveUserToGroup(uData, true);
            return;
        }


        // Take all members of a group and put them into a new room.
        if (msgData.type == SocketEvent.START_GAME_SERVER) {
            const uData: UserData = msgData.payload;
            if (uData.groupId == constants.GROUP_0 || userFromList.user.groupId == constants.GROUP_0) {
                return;
            }
            const newRoomId: string = "2" + Math.floor(Math.random() * 1000000000000);
            const usersInGroup: Array<string> = _.clone(groups[userDataList[userId].user.groupId])
            usersInGroup.forEach(userId => {
                const uData: UserData = {
                    userId: userId,
                    name: userDataList[userId].user.name,
                    groupId: undefined,
                    roomId: newRoomId
                }
                deleteUserFromGroup(uData, false);
                moveUserToRoom(uData, true);
            });

            
            // Create array with all players
            const players: Array<UserData> = [];
            usersInGroup.forEach(id => {
                players.push(userDataList[id].user);
            });

            // Create map for first level and send players/map to the players.
            const gameStartPayload: GameStartData = {
                players: players,
                mapData: {
                    meta: mapLevelMetaData[0],
                    content: createMap(mapLevelMetaData[0])
                }
            }
            const mapToSend: SocketData = {
                type: SocketEvent.START_GAME_CLIENT,
                payload: gameStartPayload
            }
            sendToRoom(JSON.stringify(mapToSend), newRoomId);
            return;
        }

        /*
        console.log("Below is the list of sockets, list of rooms, list of groups.");
        console.log(userDataList);
        console.log(rooms);
        console.log(groups);
        console.log("---");
        */

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
console.log("Listening to port: " + PORT);