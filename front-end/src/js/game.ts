import $ from "jquery";

import dom from "./dom-operator";

import {
    Map,
    MapData,
    Coord
} from "./Map";
import { Player } from "./Player";

type Players = Record<string, Coord>;

class Game {
    // Canvas viewport https://stackoverflow.com/questions/16919601/html5-canvas-camera-viewport-how-to-actually-do-it

    private _FPS = 12;
    private _INTERVAL = 1000 / this._FPS; // milliseconds

    private _multiplier: number;
    private _player: Player;
    private _players: Players;
    private _map: Map;
    private _canvas: HTMLCanvasElement;

    constructor(map: Map, player: Player, multiplier: number) {
        this._map = map;
        this._multiplier = multiplier;

        player.initialize(map.getMapData(), this._FPS)
        this._player = player;

        this._players = {
            "129387129487124": map.getStartingPoint()
        };

        setInterval(() => {
            this.gameLoop(this)
        }, this._INTERVAL);

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
            }
        });
    }

    gameLoop(thisObject: Game): void {
        thisObject._player.moveForward();
    }

    setMap(mapData: MapData): void {
        this._map.setMapData(mapData);
    }

    display(): void {
        // How to set the viewport?
        // https://stackoverflow.com/questions/16919601/html5-canvas-camera-viewport-how-to-actually-do-it

        this._map.draw();
        dom.hideAllExcept([
            "#map",
            "#palyer1",
            "#palyer2",
            "#palyer3",
            "#gamepad"
        ]);
    }
}

export default Game;
