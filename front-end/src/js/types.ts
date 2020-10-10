export enum SocketDataEnum {
    chatMessage = "chatMessage",
    userId = "userId"
}

export interface SocketData {
    type: SocketDataEnum,
    broadcast: boolean,
    recipients?: Array<string>,
    payload: any
}
