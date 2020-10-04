import $ from "./jquery-2.1.3.min";

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



$(document).ready(function () {

    // Create a user
    const user: User = createUser("Daniel");

    // Start the game.
    game();

    // Web socket.
    if (window["WebSocket"]) {

        // Socket
        const socket = new WebSocket("ws://localhost:8000");
        socket.onopen = function (e) {
            console.log("Websocket connection established.");
        };
        socket.onclose = function (e) {
            console.log("Websocket connection closed.");
        };
        // Chat
        const chat = new Chat(socket, user);
        
        const readMsgClearAndSend = function(): void {
            const val = $("#chat-editor").val();
            $("#chat-editor").val("");
            chat.sendMsg(val);
            console.log('Chat message was sent.');
        }
        
        $("#chat-editor").keypress(function (event) {
            const keycode = (event.keyCode ? event.keyCode : event.which);
            if (keycode == '13') {
                readMsgClearAndSend();
            }
        });
        $("#chat-send-button").on("click", function(event) {
            readMsgClearAndSend();
        });

        socket.onmessage = function (e) {
            const data: SocketData = JSON.parse(e.data);
            if (data.type == SocketDataEnum.chatMessage) {
                chat.receiveMsg(data.payload);
            }
        }
    }
});