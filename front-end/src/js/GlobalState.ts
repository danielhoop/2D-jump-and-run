export class GlobalState {

    private _socket: WebSocket;
    private static _instance: GlobalState;
    private serverAddress: string;


    private constructor() {

        // Create socket
        // TODO: Read address from environment viable?
        this._socket = new WebSocket("ws://192.168.0.171:8000"); // ws://localhost:8000

        // On close
        this._socket.onclose = function () {
            console.log("Websocket connection closed.");
        };

        // On Open
        this._socket.onopen = function () {
            //
        }
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