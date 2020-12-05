import * as ws from "ws";
import * as _ from "lodash";


import {
    SocketEvent,
    SocketData,
    constants,
    UserData,
    GameStartData,
    PlayerPosition,
    Scores,
    Score,
    GameEvent,
    ScorePayload
} from "./types";
import { createMap, mapLevelMetaData } from "./MapCreator";
import { MapData } from "./MapTypes";
import Database from "./Database";
import config from "./config/config";

interface UserDataAndSocket {
    user: UserData,
    socket: any
}

interface RoomData {
    userIds: Array<string>, // uid
    level: number,
    playersAtEndOfMap: Array<string>,
    startingTime: number,
    scores: Record<string, Array<number>> // For each uid, 1 array. For each map, 1 place in the array.
}
const createEmptyRoom = function (): RoomData {
    return {
        userIds: [],
        level: 0,
        playersAtEndOfMap: [],
        startingTime: 0,
        scores: {}
    }
}

// --- Attributes ---
const server = new ws.Server({ port: config.port });
const db = new Database();

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

const sendToRoom = function (txt: string, roomId: string, exceptUserId: string = undefined) {
    rooms[roomId].userIds.forEach((userId) => {
        if (userDataList[userId] && userId != exceptUserId) {
            userDataList[userId].socket.send(txt);
        }
    })
}

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
        const userData2: UserData = _.clone(userData);
        userData2.roomId = undefined;
        sendGoupOrRoomChangeInfo(userData2, sendToAll, undefined);
    }
}

const deleteUserFromGroup = function (userData: UserData, sendToAll: boolean): void {
    const { userId } = userData;
    const groupId = userDataList[userId].user.groupId;
    // Delete info in user.
    userDataList[userId].user.groupId = undefined;
    // Delete info in group.
    if (groupId && groups[groupId]) {
        groups[groupId] = _.difference(groups[groupId], [userId]);
    }
    if (sendToAll) {
        const userData2: UserData = _.clone(userData);
        userData2.groupId = undefined;
        sendGoupOrRoomChangeInfo(userData2, sendToAll, undefined);
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
    sendGoupOrRoomChangeInfo(userData, sendToAll, undefined);
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
    sendGoupOrRoomChangeInfo(userData, sendToAll, undefined);
}

const sendGoupOrRoomChangeInfo = function (userData: UserData, sendToAll: boolean, sendToUserId: string = undefined) {
    const msg: SocketData = {
        type: SocketEvent.USER_CHANGES_GROUP,
        payload: userData
    }
    if (sendToAll) {
        sendBroadcast(JSON.stringify(msg));
        return;
    }
    if (sendToUserId) {
        sendToRecipients(JSON.stringify(msg), [sendToUserId]);
    }
}

const switchToNextLevelOrStopGame = function (roomId: string) {

    const room = rooms[roomId];
    room.level++;

    if (room.level >= mapLevelMetaData.length) {

        // Calculate scores.
        let scores: Scores = []
        room.userIds.forEach(userId => {
            scores.push({
                userId: userId,
                name: userDataList[userId].user.name,
                totalTime: _.sum(room.scores[userId])
            })
        });
        // Sort scores in ascending order
        scores = _.sortBy(scores, function (o: Score) { return o.totalTime; });

        const scorePayload: ScorePayload = {
            thisGame: scores,
            allGames: db.getBestScoresEver(3)
        };

        // Send scores to players
        const scoresMsg: SocketData = {
            type: SocketEvent.END_GAME,
            payload: scorePayload
        }
        sendToRoom(JSON.stringify(scoresMsg), roomId);

        // Store scores in database.
        scores.forEach(score => {
            db.addScore(score.userId, score.name, score.totalTime, roomId);
        });


    } else {

        // Create map for next level and send map to the players.
        const payload: MapData = {
            meta: mapLevelMetaData[room.level],
            content: createMap(mapLevelMetaData[room.level])
        }
        const mapToSend: SocketData = {
            type: SocketEvent.NEXT_LVL,
            payload: payload
        }
        sendToRoom(JSON.stringify(mapToSend), roomId);

        // Set starting time for level.
        room.startingTime = new Date().getTime();
    }
}

// Server / socket functionality
server.on("connection", function (socket) {

    // Send the user his/her id, room & group.
    const userId = "1" + Math.floor(Math.random() * 1000000000000);
    const initialUserData: UserData = {
        name: constants.INITIAL_USER_NAME,
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
    // sendGoupOrRoomChangeInfo(initialUserData, false, userId)
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

        /*
        console.log("User: '" + userId + "' has left.");
        console.log("Below is the list of sockets, list of rooms, list of groups.");
        console.log(userDataList);
        console.log(rooms);
        console.log(groups);
        console.log("---");
        */
    });

    // On message...
    // When it is a broadcast, forward to all registered sockets,
    // Otherwise forward only to the recipients.
    socket.on("message", function (dat) {
        const txt: string = dat.toString();
        const msgData: SocketData = JSON.parse(txt);
        const userFromList: UserDataAndSocket = userDataList[userId];
        // console.log("on message, userId: " + userId);
        // console.log(msgData);


        // Position data is always sent to a specific room.
        // Don't send back to the sender to avoid network traffic.
        if (msgData.type == SocketEvent.POSITION) {
            const position = msgData.payload as PlayerPosition;

            if (position.yJump == position.y) {
                db.addGameEvent(position.userId, GameEvent.JUMP, position.x, position.y, new Date().getTime());
            }
            if (position.yColl == position.y) {
                db.addGameEvent(position.userId, GameEvent.COLLISION, position.x, position.y, new Date().getTime());
            }
            if (position.goal) {
                const room = rooms[msgData.roomId];

                // Check that player was not faster than is theoretically possble (cheating)
                let endingTime = new Date().getTime();
                let timeNeeded = endingTime - room.startingTime;
                // 2 fields don't have to be walked, because the player starts at the second field.
                const fastestTimePossible = ((mapLevelMetaData[room.level].mapLength - 2) / constants.MAX_FIELDS_PER_SECOND) * 1000;

                if (timeNeeded < fastestTimePossible) {
                    console.log(`The player ${position.userId} has cheated! Getting ${constants.PENALTY_SECONDS_FOR_CHEATING} penalty seconds.`)
                    console.log("  timeNeeded: " + timeNeeded);
                    console.log("  fastestTimePossible: " + fastestTimePossible);
                    endingTime = room.startingTime + (constants.PENALTY_SECONDS_FOR_CHEATING * 1000);
                    timeNeeded = endingTime - room.startingTime;
                }

                // Save to database.
                db.addGameEvent(position.userId, GameEvent.GOAL, position.x, position.y, new Date().getTime());

                // Add information to rooms list.
                room.playersAtEndOfMap.push(position.userId);
                room.scores[position.userId].push(timeNeeded);

                if (room.playersAtEndOfMap.length == room.userIds.length) {
                    room.playersAtEndOfMap = [];
                    switchToNextLevelOrStopGame(msgData.roomId);
                    return;
                }
            }

            sendToRoom(txt, msgData.roomId, position.userId);
            return;
        }


        // This case is primarily to update the name of the user on the server side.
        // Happens, when user has chosen a username.
        if (msgData.type == SocketEvent.USER_DATA) {
            const uData: UserData = msgData.payload;
            if (userId == uData.userId) {
                // Update name
                userDataList[userId].user.name = uData.name;
                // Move to groups
                moveUserToRoom(uData, true);
                moveUserToGroup(uData, true);
                // Send information about other players in groups to the one client.
                for (const key in groups) {
                    const idsInGroups = groups[key];
                    for (let i = 0; i < idsInGroups.length; i++) {
                        if (userDataList[idsInGroups[i]].user.name != constants.INITIAL_USER_NAME) {
                            sendGoupOrRoomChangeInfo(userDataList[idsInGroups[i]].user, false, userId);
                        }
                    }
                }
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
            const playersData: Array<UserData> = [];
            const userIdsInGroup: Array<string> = _.clone(groups[userDataList[userId].user.groupId])

            db.addRoom(newRoomId, new Date().getTime());

            userIdsInGroup.forEach(userId => {

                // Move players to groups
                const uData: UserData = {
                    userId: userId,
                    name: userDataList[userId].user.name,
                    groupId: undefined,
                    roomId: newRoomId
                }
                deleteUserFromGroup(uData, false);
                moveUserToRoom(uData, true);

                // Create empty entry in scores.
                rooms[newRoomId].scores[userId] = [];

                // Create array with player data (to send to clients)
                playersData.push(userDataList[userId].user);
            });

            // Create map for first level and send players/map to the players.
            const gameStartPayload: GameStartData = {
                players: playersData,
                mapData: {
                    meta: mapLevelMetaData[0],
                    content: createMap(mapLevelMetaData[0])
                }
            }
            const gameStartSocketData: SocketData = {
                type: SocketEvent.START_GAME_CLIENT,
                payload: gameStartPayload
            }
            sendToRoom(JSON.stringify(gameStartSocketData), newRoomId);

            // Set starting time for level.
            rooms[newRoomId].startingTime = new Date().getTime();
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
console.log("Listening to port: " + config.port);