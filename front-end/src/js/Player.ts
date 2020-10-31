import { MapMetaData } from "./Map";
import { PlayerPosition } from "./types";

export class Player {
    
    _userId: string;
    _meta: MapMetaData;
    _imgPath = "./img/hiker.jpg";
    _canvas: HTMLCanvasElement;
    _ctx: CanvasRenderingContext2D;

    constructor(metaData: MapMetaData, userId: string) {
        this._meta = metaData;
        this._userId = userId;
        this._canvas = document.getElementById("player1") as HTMLCanvasElement;
        this._ctx = this._canvas.getContext("2d");

        this._ctx.fillStyle = "blue";
        this._ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);

        this.updatePosition({
            userId: this._userId,
            x: this._meta.mapWidth / 2,
            y: this._meta.mapLength - 2
        });
    }

    getCanvas(): HTMLCanvasElement {
        return this._canvas;
    }

    updatePosition(position: PlayerPosition): void {
        if (position.userId == this._userId) {
            console.log("Updating position.");
            console.log(position);
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

}