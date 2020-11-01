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
    constants
} from "./types";
import { Map, MapMetaData } from "./Map";
import { Player } from "./Player";

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
        type: SocketEvent.START_GAME,
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

$(document).ready(function () {

    // Prevent default behaviour that browser scrolls to bottom of page when spacebar is pressed.
    document.documentElement.addEventListener("keydown", (event) => {
        if (event.key == " ") {
            event.preventDefault();
        }
    }, false);

    // Create a user
    const user: User = createUser("unknown");

    // Start the game.
    const meta: MapMetaData = {
        mapLength: 40.00000, mapWidth: 10.00000, trailWidth: 2.00000000, multiplier: 40,
        dir: 1.0000, stone: 0.100, animal: 0.0500, food: 0.10
    };

    const game = new Game(
        new Map(meta),
        new Player(user.id, constants.PLAYER_1),
        meta.multiplier);
    game.display();

    /*
    // Open model to give username.
    dom.hideAllExcept(["#name-modal"]);
    $("#name-editor").focus();

    // Web socket.
    if (window["WebSocket"]) {

        // Create socket
        const socket = new WebSocket("ws://localhost:8000");

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

                if (data.type == SocketEvent.USER_DATA) {
                    const payload: UserData = data.payload;
                    if (payload.name) {
                        user.name = payload.name;
                    }
                    user.id = payload.userId;
                    user.roomId = payload.roomId;
                    user.groupId = payload.groupId;

                } else if (data.type == SocketEvent.CHAT_MESSAGE) {
                    chat.receiveMsg(data.payload);

                } else if (data.type == SocketEvent.USER_CHANGES_GROUP) {
                    const payload: UserData = data.payload;
                    if (payload.userId == user.id) {
                        user.groupId = payload.groupId;
                    }
                    $("#group-member-id-" + payload.userId).remove();
                    // If no groupId was given, then just remove from group completely.
                    if (payload.groupId) {
                        $("#" + payload.groupId).children(".group-members").append(
                            '<div class="group-member" id="group-member-id-' + user.id + '">' + user.name + '</div>');
                    }
                }

                console.log("User:");
                console.log(user);
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
    */
});