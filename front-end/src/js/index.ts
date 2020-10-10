import $ from "jquery";

import dom from "./dom-operator";
import game from "./game";
import Chat from "./chat-client"
import {
    createUser,
    User,
} from "./user";
import {
    SocketData,
    SocketDataEnum,
    UserData,
    constants
} from "./types";

const setUserNameAndChangeFocus = function (user) {
    const name = $("#name-editor").val().toString();
    if (name != "") {
        user.name = name;
        $("#name-editor").val("");
        $("#msg-sender-initially").text(name);
        $("#" + constants.GROUP_0).children(".group-members").append(
            '<div class="group-member" id="group-member-id-' + user.id + '">' + name + '</div>');

        dom.hideAllExcept(["#chat", "#group-container"]);
    }
}

const readMsgClearAndSend = function (chat): void {
    const val = $("#chat-editor").val().toString();
    if (val != "") {
        $("#chat-editor").val("");
        chat.sendMsg(val);
    }
}

const moveUserToGroup = function (user: User, groupId: string, socket: WebSocket) {
    // Send data to socket
    const userData: UserData = {
        userId: user.id,
        groupId: groupId
    }
    const msg: SocketData = {
        type: SocketDataEnum.CHANGE_GROUP,
        roomId: user.roomId,
        payload: userData
    }
    socket.send(JSON.stringify(msg));
}

$(document).ready(function () {

    // Create a user
    const user: User = createUser("Daniel");

    // Open model to give username.
    dom.hideAllExcept(["#name-modal"]);
    $("#name-editor").focus();

    // Event handler on user name.
    $("#name-editor").keypress(function (event) {
        const keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode == 13) {
            setUserNameAndChangeFocus(user);
        }
    });
    $("#name-editor").on("click", function () {
        setUserNameAndChangeFocus(user);
    });

    // Start the game.
    game();

    // Web socket.
    if (window["WebSocket"]) {

        // Create socket
        const socket = new WebSocket("ws://localhost:8000");
        socket.onopen = function () {
            console.log("Websocket connection established.");
        };
        socket.onclose = function () {
            console.log("Websocket connection closed.");
        };
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

            if (data.type == SocketDataEnum.USER_DATA) {
                const payload: UserData = data.payload;
                if (payload.userId) {
                    user.id = payload.userId;
                }
                if (payload.roomId) {
                    user.roomId = payload.roomId;
                }
                if (payload.groupId) {
                    user.groupId = payload.groupId;
                }

            } else if (data.type == SocketDataEnum.CHAT_MESSAGE) {
                chat.receiveMsg(data.payload);

            } else if (data.type == SocketDataEnum.CHANGE_GROUP) {
                const payload: UserData = data.payload;
                $("#group-member-id-" + user.id).remove();
                $("#" + payload.groupId).children(".group-members").append(
                    '<div class="group-member" id="group-member-id-' + user.id + '">' + user.name + '</div>');
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
    }
});