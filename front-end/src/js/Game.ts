import $ from "jquery";

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
    private _framesSinceLastCssStyling = 999;
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
        // Prevent default behaviour that browser scrolls to bottom of page when spacebar is pressed.
        document.documentElement.addEventListener("keydown", (event) => {
            if (event.key == " ") {
                event.preventDefault();
            }
        }, false);

        dom.hideAllExcept(this._GAME_ELEMENTS);

        this._map.draw();

        // Do this 3 times, because the algorithm does not work perfectly when the difference
        // between "SOLL" and "IST" is too large.
        //for (let i = 0; i < 3; i++) {
            this.adjustCanvasCssWidth();
        //}

        this._player.initialize(this._map, this._FPS)
        if (this._players) {
            for (const key in this._players) {
                this._players[key].initialize(this._map, this._FPS);
            }
        }

        // Wait some time until the map was drawn, then start the game loop.
        const setupInterv = setInterval(() => {
            this._gameLoopInterval = setInterval(() => {
                this.gameLoop(this);
            }, this._INTERVAL);
            clearInterval(setupInterv);
        }, this._map.msNeededForDrawing);
    }

    stop(): void {
        clearInterval(this._gameLoopInterval);
    }

    private gameLoop(thisObject: Game): void {
        thisObject._player.gameLoop();
        thisObject.scroll();
        // No game loop for the other players. They have their own game loop
        // and send data via server to this client.

        // Adjust canvas dimensions to the width of the screen.
        if (this._framesSinceLastCssStyling > this._FPS) {
            this.adjustCanvasCssWidth();
            this._framesSinceLastCssStyling = 0;
        } else {
            this._framesSinceLastCssStyling++;
        }
    }

    setMap(mapData: MapData): void {
        if (this._map == undefined) {
            this._map = new Map(mapData);
        } else {
            this._map.setMap(mapData);
        }
        this.setCanvasDimensions();
    }

    updatePlayerPosition(position: PlayerPosition): void {
        // If there is no such player, then it is myself playing and therefore no update is needed.
        // Because it is only a server rebroadcast of what I already know.
        if (this._players[position.userId]) {
            this._players[position.userId].updatePosition(position);
        }
    }


    private scroll(): void {
        const viewPortHeight = $(window).height();
        const documentHeight = $(document).height();
        const partOfPathTaken = 1 - (this._player.y / this._map.getMapData().meta.mapLength);
        const pixelsWalked = partOfPathTaken * documentHeight;
        let scrollToHeight = documentHeight;
        if (pixelsWalked > viewPortHeight * 0.34) {
            scrollToHeight = documentHeight - pixelsWalked - viewPortHeight * 0.66;
        }
        window.scrollTo(0, scrollToHeight);
        /*console.log("documentHeight: " + documentHeight);
        console.log("viewPortHeight: " + viewPortHeight);
        console.log("partOfPathTaken: " + partOfPathTaken);
        console.log("pixelsWalked: " + pixelsWalked);
        console.log("scrollToHeight: " + scrollToHeight);*/
    }

    // Dynamically style canvas with CSS. Is called after each second.
    private adjustCanvasCssWidth(): void {
        const N_SQUARES_VERTICAL = 30;
        const viewPortHeight = $(window).height();
        const documentHeight = $(document).height();
        const nSquaresVertical = this._map.getMapData().meta.mapLength * viewPortHeight / documentHeight;
        const cssWidthRelativeIs = 100 * parseFloat($(".game-canvas").css("width")) / parseFloat($(".game-canvas").parent().css("width"));
        const cssWidthRelativeShould = cssWidthRelativeIs * nSquaresVertical / N_SQUARES_VERTICAL;
        if (Math.abs(cssWidthRelativeShould - cssWidthRelativeIs) > 2) {
            $(".game-canvas").css("width", cssWidthRelativeShould.toString() + "%");
            $(".game-canvas").css("margin-left", (-cssWidthRelativeShould / 2).toString() + "%");
        }
        $("#group-container").css("position", "absolute");
        $("#chat").css("position", "absolute");
        /*
        console.log("viewPortHeight: " + viewPortHeight);
        console.log("documentHeight: " + documentHeight);
        console.log("nSquaresVertical : " + nSquaresVertical);
        console.log("cssWidthRelative : " + cssWidthRelativeIs);
        console.log("cssWidthRelativeShould: " + cssWidthRelativeShould);
        */
    }

    private setCanvasDimensions(): void {
        const { mapLength, mapWidth, multiplier } = this._map.getMapData().meta;
        const height = mapLength * multiplier;
        const width = mapWidth * multiplier;
        this._GAME_ELEMENTS.forEach(element => {
            $(element).attr("height", height);
            $(element).attr("width", width);
        });
    }
}

export default Game;
