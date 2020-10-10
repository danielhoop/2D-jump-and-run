import $ from "jquery";
import { User } from "./user";
import {
    SocketData,
    SocketDataEnum
} from "./types";

interface ChatMessage {
    user: User,
    txt: string
}

class Chat {
    // msgs: Array<ChatMessage> = [];
    socket: WebSocket;
    user: User;

    constructor(socket: WebSocket, user: User) {
        this.socket = socket;
        this.user = user;
    }

    sendMsg(txt: string): void {
        const chatMsg: ChatMessage = {
            user: this.user,
            txt: txt
        };
        const socketMsg: SocketData = {
            type: SocketDataEnum.chatMessage,
            broadcast: true,
            payload: chatMsg
        };
        this.socket.send(JSON.stringify(socketMsg));
    }

    receiveMsg(msg: ChatMessage): void {
        const msgClass = msg.user.id == this.user.id ? "msg-own" : "msg-other";
        $("#chat-messages").append(
            '<div class = "' + msgClass + '"> \
            <div class = "msg-sender">' + msg.user.name + '</div> \
            <div class = "msg-txt">' + msg.txt + '</div> \
            </div>'
        );

        // Always scroll down
        const element = $("#chat-messages").get(0);
        element.scrollTop = element.scrollHeight;

        // this.msgs.push(msg);
    }

}

export default Chat;