import config from "../config/config";

export class GlobalState {

    private _socket: WebSocket;
    private static _instance: GlobalState;
    private serverAddress: string;

    private constructor() {

        // Create socket
        // TODO: Read address from environment viable?
        this._socket = new WebSocket("ws://" + config.serverIpPort);
        console.log("Websocket address: " + "ws://" + config.serverIpPort);

        // On close
        this._socket.onclose = function () {
            console.log("Websocket connection closed.");
        };
    }

    static getInstance(): GlobalState {
        if (GlobalState._instance == undefined) {
            GlobalState._instance = new GlobalState();
        }
        return GlobalState._instance;
    }

    getSocket(): WebSocket {
        return this._socket;
    }
}