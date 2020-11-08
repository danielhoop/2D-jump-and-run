import dom from "./dom-operator";

import { Map } from "./Map";
import { MapData } from "./MapTypes";
import { Player, Players } from "./Player";
import { PlayerPosition } from "./types";

class Game {
    // Canvas viewport https://stackoverflow.com/questions/16919601/html5-canvas-camera-viewport-how-to-actually-do-it

    private _FPS = 22;
    private _INTERVAL = 1000 / this._FPS; // milliseconds
    private _GAME_ELEMENTS = [
        "#map",
        "#player1",
        "#player2",
        "#player3",
        "#velocity",
        "#gamepad"];

    private _gameLoopInterval;
    private _player: Player;
    private _players: Players;
    private _map: Map;

    constructor(player: Player, players: Players) {
        this._player = player;
        this._players = players;

        //this._map.getCanvas().addEventListener("keydown", (event) => {
        document.getElementById("gamepad").addEventListener("klck", (event) => {
            // Do it like this?
            // https://lavrton.com/hit-region-detection-for-html5-canvas-and-how-to-listen-to-click-events-on-canvas-shapes-815034d7e9f8/
        });

        window.addEventListener("keydown", (event) => {
            const key = event.key; // "ArrowRight", "ArrowLeft", "ArrowUp", or "ArrowDown"
            if (key == "ArrowRight") {
                this._player.moveRight();
            } else if (key == "ArrowLeft") {
                this._player.moveLeft();
            } else if (key == "ArrowUp") {
                // Do nothing
            } else if (key == "ArrowDown") {
                // Do nothing
            } else if (key == " ") {
                this._player.jump();
            }
        });
    }

    start(): void {
        this._map.draw();
        this._player.initialize(this._map, this._FPS)
        if (this._players) {
            for (const key in this._players) {
                this._players[key].initialize(this._map, this._FPS);
            }
        }
        dom.hideAllExcept(this._GAME_ELEMENTS);

        // Wait some time until the map was drawn, then start the game loop.
        const setupInterv = setInterval(() => {
            this._gameLoopInterval = setInterval(() => {
                this.gameLoop(this)
            }, this._INTERVAL);
            clearInterval(setupInterv);
        }, this._map.msNeededForDrawing);
    }

    stop(): void {
        clearInterval(this._gameLoopInterval);
    }

    private gameLoop(thisObject: Game): void {
        thisObject._player.gameLoop();
        // No game loop for the other players. They have their own game loop
        // and send data via server to this client.
    }

    setMap(mapData: MapData): void {
        if (this._map == undefined) {
            this._map = new Map(mapData);
        } else {
            this._map.setMap(mapData);
        }
    }

    updatePlayerPosition(position: PlayerPosition): void {
        // If there is no such player, then it is myself playing and therefore no update is needed.
        // Because it is only a server rebroadcast of what I already know.
        if (this._players[position.userId]) {
            this._players[position.userId].updatePosition(position);
        }
    }
}

export default Game;
