export enum SocketDataEnum {
    chatMessage = "chatMessage",
    userId = "userId"
}

export interface SocketData {
    type: string,
    broadcast: boolean,
    recipients?: Array<string>,
    payload: any
}
