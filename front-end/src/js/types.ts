export enum SocketDataEnum {
    chatMessage = 'chatMessage'
}

export interface SocketData {
    type: string,
    payload: any
}
