import dom from "./dom-operator";

import {
    Map,
    MapMetaData
} from "./Map";
import { Player } from "./Player";

type Players = Record<string, unknown>;

class Game {
    // Canvas viewport https://stackoverflow.com/questions/16919601/html5-canvas-camera-viewport-how-to-actually-do-it

    private _FPS = 15;
    private _INTERVAL = 1000 / this._FPS; // milliseconds
    private _GAME_ELEMENTS = [
        "#map",
        "#palyer1",
        "#palyer2",
        "#palyer3",
        "#velocity",
        "#gamepad"];

    private _player: Player;
    private _players: Players;
    private _map: Map;
    private _canvas: HTMLCanvasElement;

    constructor(player: Player, players: Players) {
        this._player = player;
        this._players = players;
        this.setLevel1();

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
        setInterval(() => {
            this.gameLoop(this)
        }, this._INTERVAL);

        this._map.draw();
        dom.hideAllExcept(this._GAME_ELEMENTS);
    }

    private gameLoop(thisObject: Game): void {
        thisObject._player.gameLoop();
    }

    private setMap(meta: MapMetaData): void {
        if (this._map == undefined) {
            this._map = new Map(meta);
        } else {
            this._map.createNewMap(meta);
        }
        this._player.initialize(this._map, this._FPS)
        /* TODO: Uncomment this, when other players work.
        for (const key in this._players) {
            this._players[key].initialize(this._map, this._FPS);
        } */
    }

    private setLevel1(): void {
        const meta: MapMetaData = {
            // Backup that works: mapLength: 40, mapWidth: 10, trailWidth: 2, multiplier: 40, dir: 1, stone: 0.1, animal: 0.05, food: 0.10
            mapLength: 40, mapWidth: 10, trailWidth: 2, multiplier: 40, dir: 1, stone: 0.1, animal: 0.05, food: 0.10
        };
        this.setMap(meta);
    }
}

export default Game;
