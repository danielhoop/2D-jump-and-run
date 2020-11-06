import $ from "jquery";

import { Map } from "./Map";
import { constants, PlayerPosition } from "./types";

export class Player {

    private _userId: string;
    private _playerNo: number;
    private _yAtLastCollision = 99999;
    private _yAtLastJump = 99999;
    private _hasJustCollided = false;
    private _isJumping = false;
    private _x: number;
    private _y: number;
    private _FPS: number;
    private _velocity: number;
    private _MIN_VELOCITY = 1;
    private _MAX_VELOCITY = 4;
    private _MAX_FIELDS_PER_SECOND = 4;
    private _JUMP_DISTANCE = 2.3;
    private _COLLISON_DISTANCE = 2.01;
    private _map: Map;
    private _imgPath: string;
    private _veloImgPath = "./img/velo-points.png";
    private _canvas: HTMLCanvasElement;
    private _ctx: CanvasRenderingContext2D;
    private _veloCtx: CanvasRenderingContext2D;

    constructor(userId: string, playerNo: number) {
        this._userId = userId;
        this._playerNo = playerNo;
        this._imgPath = this.playerNoToImagePath();

        this._canvas = document.getElementById(this.playerNoToHtml()) as HTMLCanvasElement;
        this._ctx = this._canvas.getContext("2d");

        const veloCanv = document.getElementById("velocity") as HTMLCanvasElement;
        this._veloCtx = veloCanv.getContext("2d");

        this._velocity = 2;
        if (this._velocity > this._MAX_VELOCITY) {
            this._velocity = this._MAX_VELOCITY;
        }
    }

    initialize(map: Map, fps: number): void {
        this._map = map;
        this._FPS = fps;

        this.updatePosition({
            userId: this._userId,
            x: Math.floor(this._map.getMapData().meta.mapWidth / 2),
            y: this._map.getMapData().meta.mapLength - 2
        });

        this.drawVelocity();
    }

    private playerNoToHtml(): string {
        return {
            [constants.PLAYER_1]: "player1",
            [constants.PLAYER_2]: "player2",
            [constants.PLAYER_3]: "player3"
        }[this._playerNo.toString()];
    }
    private playerNoToImagePath(): string {
        return {
            [constants.PLAYER_1]: "./img/hiker-colored.png",
            [constants.PLAYER_2]: "./img/hiker.png",
            [constants.PLAYER_3]: "./img/hiker.png"
        }[this._playerNo.toString()];
    }

    /*getCanvas(): HTMLCanvasElement {
        return this._canvas;
    }*/

    updatePosition(position: PlayerPosition): void {
        if (position.userId == this._userId) {
            if (position.x >= this._map.getMapData().meta.mapWidth || position.x < 0 || position.y < 0) {
                return;
            }
            this._x = position.x;
            this._y = position.y;

            // Reset collision and jumping information.
            this._isJumping = !(this._yAtLastJump - this._y > this._JUMP_DISTANCE);
            this._hasJustCollided = !(this._yAtLastCollision - this._y > this._COLLISON_DISTANCE);

            // Draw the avatar
            const m = this._map.getMapData().meta.multiplier;
            const img = new Image();
            img.onload = () => {
                // Drawing the image with coordinates pointing to top-left corner.
                this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
                if (this._isJumping) {
                    // Shadow below figure. Figure is slightly larger than usually.
                    this._ctx.fillStyle = "gray";
                    this._ctx.fillRect(position.x * m - m * 0.40, position.y * m - m * 0.40, m * 1.60, m * 1.60);
                    this._ctx.drawImage(img, position.x * m - m * 0.20, position.y * m - m * 0.20, m * 1.20, m * 1.20);
                } else {
                    // Normal sized figure.
                    this._ctx.drawImage(img, position.x * m, position.y * m, m, m);
                }
            }
            img.src = this._imgPath;

            // Handle collisions
            if (!this._isJumping) {
                const playerCoord = { x: this._x, y: this._y };
                if (!this._hasJustCollided && this._map.touchesObstacle(playerCoord)) {
                    this._yAtLastCollision = this._y;
                    this.decreaseVelocity();
                    this._hasJustCollided = true;
                }
                if (this._map.touchesFood(playerCoord)) {
                    this.increaseVelocity();
                }
            }

            // Scroll to right place
            const viewPortHeight = $(window).height();
            const documentHeight = $(document).height();
            const partOfPathTaken = 1 - (this._y / this._map.getMapData().meta.mapLength);
            const pixelsWalked = partOfPathTaken * documentHeight;
            let scrollToHeight  = documentHeight;
            if (pixelsWalked > viewPortHeight / 2) {
                scrollToHeight = documentHeight - pixelsWalked - viewPortHeight / 2;
            }
            window.scrollTo(0, scrollToHeight);
            /*console.log("documentHeight: " + documentHeight);
            console.log("viewPortHeight: " + viewPortHeight);
            console.log("partOfPathTaken: " + partOfPathTaken);
            console.log("pixelsWalked: " + pixelsWalked);
            console.log("scrollToHeight: " + scrollToHeight);*/
        }
    }

    // moveForward is called for each frame (game loop).
    gameLoop(): void {
        this.moveForward();
        this.drawVelocity();
    }
    private moveForward(): void {
        const position: PlayerPosition = { userId: this._userId, x: this._x, y: this._y }
        if (position.y <= 0) {
            // TODO send message to socket that tells that player is at end of course.
            return;
        }
        position.y = position.y - (this._velocity / this._MAX_VELOCITY * this._MAX_FIELDS_PER_SECOND / this._FPS);
        this.updatePosition(position);
    }
    moveRight(): void {
        const position: PlayerPosition = { userId: this._userId, x: this._x, y: this._y }
        position.x = position.x + 1;
        this.updatePosition(position);
    }
    moveLeft(): void {
        const position: PlayerPosition = { userId: this._userId, x: this._x, y: this._y }
        position.x = position.x - 1;
        this.updatePosition(position);
    }

    jump(): void {
        if (!this._isJumping) {
            this._yAtLastJump = this._y;
            // To draw immediately another picture. Even though position has not changed.
            this.updatePosition({ userId: this._userId, x: this._x, y: this._y });
        }
    }

    private setVelocity(value: number): void {
        if (value < this._MIN_VELOCITY || value > this._MAX_VELOCITY) {
            return;
        }
        this._velocity = value;
        this.drawVelocity();
    }
    private increaseVelocity(): void {
        this.setVelocity(this._velocity + 1);
    }
    private decreaseVelocity(): void {
        this.setVelocity(this._velocity - 1);
    }
    private drawVelocity(y: number = undefined): void {
        if (y === undefined) {
            if (this._y < this._map.getMapData().meta.mapLength - this._MAX_VELOCITY - 3) {
                y = this._y + this._MAX_VELOCITY + 1
            }
            if (y === undefined) {
                y = this._map.getMapData().meta.mapLength - 2;
            }
        }
        const x = this._map.getMapData().meta.mapWidth - 2;
        const m = this._map.getMapData().meta.multiplier;
        const img = new Image();
        img.onload = () => {
            // Drawing the image with coordinates pointing to top-left corner.
            this._veloCtx.clearRect(0, 0, this._canvas.width, this._canvas.height);
            for (let velo = this._MIN_VELOCITY; velo <= this._velocity; velo++) {
                this._veloCtx.drawImage(img, x * m, (y - velo + 1) * m, m, m);
            }
        }
        img.src = this._veloImgPath;
    }
}