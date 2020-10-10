export const constants = {
    LOBBY: "LOBBY"
}

export enum SocketDataEnum {
    CHAT_MESSAGE = "CHAT_MESSAGE",
    USER_DATA = "USER_DATA"
}

export interface UserData {
    userId?: string,
    roomId?: string
}

export interface SocketData {
    type: SocketDataEnum,
    broadcast?: boolean,
    recipientIds?: Array<string>,
    roomId?: string;
    payload: any
}
