import $ from "jquery";

import dom from "./dom-operator";
import Game from "./Game";
import Chat from "./Chat"
import {
    createUser,
    User,
} from "./User";
import {
    SocketData,
    SocketEvent,
    UserData,
    constants,
    GameStartData,
    PlayerPosition,
    Scores,
} from "./types";
import { Player, Players } from "./Player";
import { GlobalState } from "./GlobalState";
import { MapData } from "./MapTypes";
import domOperator from "./dom-operator";

const setUserNameAndChangeFocus = function (user: User, socket: WebSocket) {
    const name = $("#name-editor").val().toString();
    if (name != "") {
        user.name = name;
        $("#name-editor").val("");
        $("#msg-sender-initially").text(name);
        $("#" + constants.GROUP_0).children(".group-members").append(
            '<div class="group-member" id="group-member-id-' + user.id + '">' + name + '</div>');

        dom.hideAllExcept(["#chat", "#group-container"]);

        // Tell the server the name of the user.
        const userData: UserData = {
            name: user.name,
            userId: user.id,
            roomId: user.roomId,
            groupId: user.groupId
        }
        const msg: SocketData = {
            type: SocketEvent.USER_DATA,
            roomId: user.roomId,
            payload: userData
        }
        socket.send(JSON.stringify(msg));
    }
}

const readMsgClearAndSend = function (chat: Chat): void {
    const val = $("#chat-editor").val().toString();
    if (val != "") {
        $("#chat-editor").val("");
        chat.sendMsg(val);
    }
}

const startGame = function (user: User, groupId: string, socket: WebSocket) {
    /* const memberIds: Array<string> = [];
    $("#" + groupId).children(".group-members").children().each(function () {
        const id = $(this).attr('id');
        memberIds.push(id.substring("group-member-id-".length));
    }); */
    console.log(user);
    console.log(groupId);
    if (user.groupId == constants.GROUP_0 || user.groupId != groupId) {
        return;
    }
    const userData: UserData = {
        name: user.name,
        userId: user.id,
        roomId: user.roomId,
        groupId: user.groupId
    }
    const msg: SocketData = {
        type: SocketEvent.START_GAME_SERVER,
        roomId: user.roomId,
        payload: userData
    }
    socket.send(JSON.stringify(msg));
}

const moveUserToGroup = function (user: User, groupId: string, socket: WebSocket) {
    // Send data to socket
    const userData: UserData = {
        name: user.name,
        userId: user.id,
        roomId: user.roomId,
        groupId: groupId
    }
    const msg: SocketData = {
        type: SocketEvent.USER_CHANGES_GROUP,
        roomId: user.roomId,
        payload: userData
    }
    socket.send(JSON.stringify(msg));
}

const constLength = function (x: number, length: number, add = "0") {
    let a = x + "";
    while (a.length < length) {
        a = add + a;
    }
    return a;
}

const msToMmSsMs = function (ms: number): string {
    const mm = Math.floor(ms / 60000);
    ms = ms % 60000;
    const ss = Math.floor(ms / 1000);
    ms = ms % 1000;

    return constLength(mm, 2) + ":" + constLength(ss, 2) + "." + constLength(ms, 3);
}

let game: Game = undefined;

$(document).ready(function () {

    // Prevent default behaviour that browser scrolls to bottom of page when spacebar is pressed.
    document.documentElement.addEventListener("keydown", (event) => {
        if (event.key == " ") {
            event.preventDefault();
        }
    }, false);

    // Create a user
    const user: User = createUser("unknown");

    // Open model to give username.
    dom.hideAllExcept(["#name-modal"]);
    $("#name-editor").focus();

    // Web socket.
    if (window["WebSocket"]) {

        // Create socket
        const socket = GlobalState.getInstance().getSocket();

        // On close
        socket.onclose = function () {
            console.log("Websocket connection closed.");
        };

        // Only if socket has opened, create event handlers!
        // And inside is 'socket.onmessage'
        socket.onopen = function () {
            console.log("Websocket connection established.");

            // Event handler on user name.
            $("#name-editor").keypress(function (event) {
                const keycode = (event.keyCode ? event.keyCode : event.which);
                if (keycode == 13) {
                    setUserNameAndChangeFocus(user, socket);
                }
            });
            $("#name-enter-button").on("click", function () {
                setUserNameAndChangeFocus(user, socket);
            });

            // Chat
            const chat = new Chat(socket, user);

            $("#chat-editor").keypress(function (event) {
                const keycode = (event.keyCode ? event.keyCode : event.which);
                if (keycode == 13) {
                    readMsgClearAndSend(chat);
                }
            });
            $("#chat-send-button").on("click", function () {
                readMsgClearAndSend(chat);
            });

            // On message...
            socket.onmessage = function (e) {
                const data: SocketData = JSON.parse(e.data);
                console.log("Received message:"); console.log(data);

                if (data.type == SocketEvent.POSITION) {
                    const playerPosition = data.payload as PlayerPosition;
                    game.updatePlayerPosition(playerPosition);


                } else if (data.type == SocketEvent.CHAT_MESSAGE) {
                    chat.receiveMsg(data.payload);


                } else if (data.type == SocketEvent.USER_DATA) {
                    // If the user has no id, then it must be initialized.
                    const payload: UserData = data.payload;

                    if (!user.id) {
                        if (payload.name) {
                            user.name = payload.name;
                        }
                        user.id = payload.userId;
                    }


                } else if (data.type == SocketEvent.USER_CHANGES_GROUP) {
                    const payload: UserData = data.payload;
                    if (payload.userId == user.id) {
                        user.groupId = payload.groupId;
                        user.roomId = payload.roomId;
                    }
                    $("#group-member-id-" + payload.userId).remove();
                    // If no groupId was given, then just remove from group completely.
                    if (payload.groupId) {
                        $("#" + payload.groupId).children(".group-members").append(
                            '<div class="group-member" id="group-member-id-' + payload.userId + '">' + payload.name + '</div>');
                    }


                } else if (data.type == SocketEvent.START_GAME_CLIENT) {
                    const payload = data.payload as GameStartData;
                    const otherPlayers = payload.players;
                    for (let i = 0; i < otherPlayers.length; i++) {
                        if (otherPlayers[i].userId == user.id) {
                            otherPlayers.splice(i, 1);
                        }
                    }
                    game = new Game(
                        new Player(user, Player.PLAYER_1, true),
                        Player.createOtherPlayers(otherPlayers));
                    game.setMap(payload.mapData);
                    game.start();


                } else if (data.type == SocketEvent.NEXT_LVL) {
                    const mapData = data.payload as MapData;
                    game.stop();
                    game.setMap(mapData);
                    game.start();


                } else if (data.type == SocketEvent.END_GAME) {
                    game.stop();

                    const scores = data.payload as Scores;
                    scores.forEach(score => {
                        $("#score-table").append(
                            `<tr class="score-row"><td class="score-name">${score.name}</td><td class="score-time">${msToMmSsMs(score.totalTime)}</td></tr>`
                        );
                        $("#scores").append(`<div class="score"><div>${score.name}</div><div>${msToMmSsMs(score.totalTime)}</div></div>`);
                    });
                    domOperator.hideAllExcept(["#score-modal"]);

                    if (scores[0].userId == user.id) {
                        new Audio("./sound/Congratulations.mp3").play();
                        $("#scores-title").text("Congratulations! You have won the game!");
                    } else {
                        new Audio("./sound/MaybeNextTime.mp3").play();
                        $("#scores-title").text("Maybe next time...");
                    }

                }

            }

            // Changing the group
            $("#" + constants.GROUP_0).on("click", function () {
                moveUserToGroup(user, constants.GROUP_0, socket);
            })
            $("#" + constants.GROUP_1).on("click", function () {
                moveUserToGroup(user, constants.GROUP_1, socket);
            });
            $("#" + constants.GROUP_2).on("click", function () {
                moveUserToGroup(user, constants.GROUP_2, socket);
            });
            $("#" + constants.GROUP_3).on("click", function () {
                moveUserToGroup(user, constants.GROUP_3, socket);
            });

            // Start a game
            $("#" + constants.BUTTON_GROUP_1).on("click", function () {
                console.log("fired: " + constants.GROUP_1);
                startGame(user, constants.GROUP_1, socket);
            })
            $("#" + constants.BUTTON_GROUP_2).on("click", function () {
                console.log("fired: " + constants.GROUP_2);
                startGame(user, constants.GROUP_2, socket);
            })
            $("#" + constants.BUTTON_GROUP_3).on("click", function () {
                console.log("fired: " + constants.GROUP_3);
                startGame(user, constants.GROUP_3, socket);
            })
        };
    }
});