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
    msgs: Array<ChatMessage> = [];
    socket: WebSocket;
    user: User;

    constructor(socket: WebSocket, user: User) {
        this.socket = socket;
        this.user = user;
    }

    sendMsg(txt: string): void {
        const chatMsg: ChatMessage = {
            user: this.user,
            txt: txt };
        const socketMsg: SocketData = {
            type: SocketDataEnum.chatMessage,
            payload: chatMsg };
        this.socket.send(JSON.stringify(socketMsg));
    }

    receiveMsg(msg: ChatMessage): void {
        this.msgs.push(msg);
        console.log(this.msgs);
    }

}

export default Chat;