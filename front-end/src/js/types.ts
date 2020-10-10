export const constants = {
    LOBBY: "LOBBY",
    GROUP_0: "group-id-0",
    GROUP_1: "group-id-1",
    GROUP_2: "group-id-2",
    GROUP_3: "group-id-3"
}

export enum SocketDataEnum {
    CHAT_MESSAGE = "CHAT_MESSAGE",
    USER_DATA = "USER_DATA",
    CHANGE_GROUP = "CHANGE_GROUP"
}

export interface UserData {
    userId?: string,
    roomId?: string,
    groupId?: string
}

export interface SocketData {
    type: SocketDataEnum,
    broadcast?: boolean,
    recipientIds?: Array<string>,
    roomId?: string;
    payload: any
}
