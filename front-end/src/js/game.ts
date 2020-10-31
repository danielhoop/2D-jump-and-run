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

    _multiplier: number;
    _player: Player;
    _players: Players;
    _map: Map;
    _canvas: HTMLCanvasElement;
    _ctx: CanvasRenderingContext2D;

    constructor(map: Map, player: Player, multiplier: number) {
        this._map = map;
        this._multiplier = multiplier;
        this._player = player;
        this
        this._players = {
            "129387129487124": map.getStartingPoint()
        };

        this._map.getCanvas().addEventListener("keydown", (event) => {
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
        dom.hideAllExcept([
            "#map",
            "#palyer1",
            "#palyer2",
            "#palyer3",
        ]);
    }
}

export default Game;
