import { MapMetaData } from "./Map";
import { PlayerPosition } from "./types";

export class Player {
    
    private _userId: string;
    private _x: number;
    private _y: number;
    private _FPS: number;
    private _velocity = 4;
    private _MIN_VELOCITY = 1;
    private _MAX_VELOCITY = 4;
    private _FIELDS_PER_SECOND = 2;
    private _meta: MapMetaData;
    private _imgPath = "./img/hiker-colored.png";
    private _canvas: HTMLCanvasElement;
    private _ctx: CanvasRenderingContext2D;

    constructor(metaData: MapMetaData, userId: string) {
        this._meta = metaData;
        this._userId = userId;
        if (this._velocity > this._MAX_VELOCITY) {
            this._velocity = this._MAX_VELOCITY;
        }
        this._canvas = document.getElementById("player1") as HTMLCanvasElement;
        this._ctx = this._canvas.getContext("2d");

        this.updatePosition({
            userId: this._userId,
            x: Math.floor(this._meta.mapWidth / 2),
            y: this._meta.mapLength - 3
        });
    }

    setFps(fps: number): void {
        this._FPS = fps;
    }

    getCanvas(): HTMLCanvasElement {
        return this._canvas;
    }

    updatePosition(position: PlayerPosition): void {
        if (position.userId == this._userId) {
            if (position.x >= this._meta.mapWidth || position.x < 0) {
                return;
            }
            this._x = position.x;
            this._y = position.y;
            this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
            const m = this._meta.multiplier;
            const img = new Image();
                img.onload = () => {
                    // Drawing the image with coordinates pointing to top-left corner.
                    this._ctx.drawImage(img, position.x * m, (position.y + 1) * m, m, m);
                }
                img.src = this._imgPath;
        }
    }

    // moveForward is called for each frame.
    moveForward(): void {
        const position: PlayerPosition = { userId: this._userId, x: this._x, y: this._y }
        console.log(position.y);
        if (position.y <= 0) {
            // TODO send message to socket that tells that player is at end of course.
            return;
        }
        position.y = position.y - (this._velocity / this._MAX_VELOCITY * this._FIELDS_PER_SECOND / this._FPS);
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

    setVelocity(value: number): void {
        if (value <= this._MIN_VELOCITY || value >= this._MAX_VELOCITY) {
            return;
        }
        this._velocity = value;
    }
    increaseVelocity(): void {
        this.setVelocity(this._velocity + 1);
    }
    decreaseVelocity(): void {
        this.setVelocity(this._velocity - 1);
    }
}