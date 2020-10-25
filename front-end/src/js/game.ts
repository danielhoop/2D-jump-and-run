import $ from "jquery";

import dom from "./dom-operator";

import {
    Map,
    MapData,
    Coord
} from "./Map";

type Players = Record<string, Coord>;

class Game {

    _multiplier: number;
    _player: Coord;
    _players: Players;
    _map: Map;
    _canvas: HTMLCanvasElement;
    _ctx: CanvasRenderingContext2D;

    constructor(map: Map, multiplier: number) {
        this._map = map;
        this._multiplier = multiplier;
        this._player = map.getStartingPoint();
        this._players = {
            "129387129487124": map.getStartingPoint()
        };
        this._canvas = document.getElementById("game") as HTMLCanvasElement;
        this._ctx = this._canvas.getContext("2d");

        const canvas = this._canvas;
        const ctx = this._ctx;

        //ctx.fillStyle = "blue";
        //ctx.fillRect(0, 0, canvas.width, canvas.height);

        canvas.addEventListener("keydown", (event) => {
            const key = event.key; // "ArrowRight", "ArrowLeft", "ArrowUp", or "ArrowDown"
            if (key == "ArrowRight") {
                //
            } else if (key == "ArrowLeft") {
                //
            } else if (key == "ArrowUp") {
                //
            } else if (key == "ArrowDown") {
                //
            }
        })
    }

    setMap(mapData: MapData): void {
        this._map.setMap(mapData);
    }

    display(): void {
        // How to set the viewport?
        // https://stackoverflow.com/questions/16919601/html5-canvas-camera-viewport-how-to-actually-do-it

        this._map.draw();
        dom.hideAllExcept(["#game"]);
    }
}

export default Game;
