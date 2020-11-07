export const constants = {
    LOBBY: "LOBBY",
    GROUP_0: "group-id-0",
    GROUP_1: "group-id-1",
    GROUP_2: "group-id-2",
    GROUP_3: "group-id-3",
    BUTTON_GROUP_1: "button-group-id-1",
    BUTTON_GROUP_2: "button-group-id-2",
    BUTTON_GROUP_3: "button-group-id-3",
    PLAYER_1: 1,
    PLAYER_2: 2,
    PLAYER_3: 3
}

export enum SocketEvent {
    CHAT_MESSAGE = "CHAT_MESSAGE",
    USER_DATA = "USER_DATA",
    USER_CHANGES_GROUP = "USER_CHANGES_GROUP",
    START_GAME = "START_GAME",
    PLAYER_POSITION_UPDATE = "PLAYER_POSITION_UPDATE"
}

export interface UserData {
    name: string,
    userId: string,
    roomId: string,
    groupId: string
}

export interface SocketData {
    type: SocketEvent,
    broadcast?: boolean,
    recipientIds?: Array<string>,
    roomId?: string;
    payload: any
}

export interface PlayerPosition {
    userId?: string,
    x: number,
    y: number,
    yJump?: number, // y at last jump
    yColl?: number, // y at last collision
    other?: boolean // Was the position sent by another player or by myself?
}