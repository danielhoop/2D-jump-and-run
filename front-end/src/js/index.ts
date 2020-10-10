import $ from "jquery";

import dom from "./dom-operator";
import game from "./game";
import Chat from "./chat-client"
import {
    createUser,
    User
} from "./user";
import {
    SocketData,
    SocketDataEnum,
} from "./types";


const setUserNameAndChangeFocus = function (user) {
    const name = $("#name-editor").val().toString();
    if (name != "") {
        user.name = name;
        $("#name-editor").val("");
        dom.hideAllExcept(["#chat"]);
        $("#msg-sender-initially").text(name);
    }
}

const readMsgClearAndSend = function (chat): void {
    const val = $("#chat-editor").val().toString();
    if (val != "") {
        $("#chat-editor").val("");
        chat.sendMsg(val);
    }
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

        // Socket
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

        socket.onmessage = function (e) {
            const data: SocketData = JSON.parse(e.data);
            switch (data.type) {
                case SocketDataEnum.userId:
                    user.id = data.payload;
                    console.log("After receiving user id, the userId is: " + user.id);
                    break;
                case SocketDataEnum.chatMessage:
                    chat.receiveMsg(data.payload);
                    break;
            }
        }
    }
});