import { MapData } from "./MapTypes";

export const constants = {
    INITIAL_USER_NAME: "xeox7xmknUQlMWB8D0IR",
    LOBBY: "LOBBY",
    GROUP_0: "group-id-0",
    GROUP_1: "group-id-1",
    GROUP_2: "group-id-2",
    GROUP_3: "group-id-3",
    BUTTON_GROUP_1: "button-group-id-1",
    BUTTON_GROUP_2: "button-group-id-2",
    BUTTON_GROUP_3: "button-group-id-3",
    MAX_ROOM_SIZE: 3
}

export enum SocketEvent {
    CHAT_MESSAGE = "CHAT_MESSAGE",
    USER_DATA = "USER_DATA",
    USER_CHANGES_GROUP = "USER_CHANGES_GROUP",
    START_GAME_CLIENT = "START_GAME_CLIENT",
    START_GAME_SERVER = "START_GAME_SERVER",
    NEXT_LVL = "NEXT_LVL",
    END_GAME = "END_GAME",
    POSITION = "POSITION"
}

export enum GameEvent {
    COLLISION = 0,
    JUMP = 1,
    GOAL = 2
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
    userName?: string,
    x: number,
    y: number,
    yJump?: number, // y at last jump
    yColl?: number, // y at last collision
    goal?: boolean, // Player has reached goal?
    other?: boolean // Was the position sent by another player or by myself?
}

export interface GameStartData {
    players: Array<UserData>,
    mapData: MapData
}

export type Score = { userId: string, name: string, totalTime: number };
export type Scores = Array<Score>;