import $ from "jquery";
import { MapContent, MapMetaData, ImageType, MapData, Coord, FieldType } from "./MapTypes";

export class Map {

    private _content: MapContent;
    private _meta: MapMetaData;

    private _canvas: HTMLCanvasElement;
    private _ctx: CanvasRenderingContext2D;

    private _allImagesInOrder: Array<ImageType> = [
        // It is important that GRASS is first, then trail (background)!
        ImageType.GRASS,
        ImageType.TRAIL,
        ImageType.STONE,
        ImageType.BIRD1,
        ImageType.BIRD2,
        ImageType.APPLE,
        ImageType.BANANA
    ]
    private _typeToPathData: Record<ImageType, string> = {
        [ImageType.TRAIL]: "./img/trail.png",
        [ImageType.GRASS]: "./img/grass.png",
        [ImageType.STONE]: "./img/stone.png",
        [ImageType.BIRD1]: "./img/bird-1.png",
        [ImageType.BIRD2]: "./img/bird-2.png",
        [ImageType.APPLE]: "./img/apple.png",
        [ImageType.BANANA]: "./img/banana.png"
    }

    private _msBetweenDrawing = 50;
    private _nImgTypesToDraw = this._allImagesInOrder.length;
    msNeededForDrawing = this._msBetweenDrawing * this._nImgTypesToDraw;

    constructor(mapData: MapData) {
        this.setMap(mapData);
        this._canvas = document.getElementById("map") as HTMLCanvasElement;
        this._ctx = this._canvas.getContext("2d");
    }

    private imgToPath(type: ImageType): string {
        return this._typeToPathData[type];
    }

    setMap(mapData: MapData): void {
        this._meta = mapData.meta;
        this._content = mapData.content;
    }

    getMapData(): MapData {
        return { content: this._content, meta: this._meta };
    }

    // Works only because there is a 50ms break between the loading of each image.
    // Else, the order of loading cannot be controlled and therefore applies might be drawn
    // before grass, and therefore be overpainted by grass.
    draw(): void {
        const content = this._content;
        const m = this._meta.multiplier;

        let i = 0;
        const interv = setInterval(() => {
            if (i == this._allImagesInOrder.length) {
                clearInterval(interv);
            } else {
                const image: ImageType = this._allImagesInOrder[i];
                const img = new Image();
                img.src = this.imgToPath(image);
                img.onload = () => {
                    for (let y = 0; y < content.length; y++) {
                        for (let x = 0; x < content[y].length; x++) {
                            // Drawing the image with coordinates pointing to top-left corner.
                            const field = content[y][x];
                            if (image == ImageType.GRASS ||
                                (image == ImageType.TRAIL && field.isTrail) ||
                                image == field.image) {
                                this._ctx.drawImage(img, x * m, y * m, m, m);
                            }
                        }
                    }
                }
                window.scrollTo(0, $(document).height());
                i++;
            }
        }, this._msBetweenDrawing);
    }

    /*
    private draw_slowVersion(): void {
        const content = this._content;
        const m = this._meta.multiplier;
        for (let y = 0; y < content.length; y++) {
            for (let x = 0; x < content[y].length; x++) {
                const field = content[y][x];
                // First the background.
                if (field.image != ImageType.TRAIL && field.image != ImageType.GRASS) {
                    const imgBg = new Image();
                    imgBg.onload = () => {
                        // Drawing the image with coordinates pointing to top-left corner.
                        this._ctx.drawImage(imgBg, x * m, y * m, m, m);
                    }
                    if (field.isTrail) {
                        imgBg.src = this.imgToPath(ImageType.TRAIL);
                    } else {
                        imgBg.src = this.imgToPath(ImageType.GRASS);
                    }

                }
                // Then the object
                const img = new Image();
                img.onload = () => {
                    // Drawing the image with coordinates pointing to top-left corner.
                    this._ctx.drawImage(img, x * m, y * m, m, m);
                }
                img.src = this.imgToPath(field.image);
            }
        }
    }
    */

    getStartingPoint(): Coord {
        return {
            x: Math.floor(this._meta.mapWidth / 2),
            y: this._meta.mapLength - 2
        };
    }

    private touchesSomething(coord: Coord, what: FieldType): Coord {
        const cont = this._content;
        for (let x = Math.max(0, Math.floor(coord.x)); x < coord.x + 1 && x < this._meta.mapWidth; x++) {
            for (let y = Math.max(0, Math.floor(coord.y)); y < coord.y + 1 && y < this._meta.mapLength; y++) {
                if (cont[y][x].type == what) {
                    const dX = coord.x - x;
                    const dY = coord.y - y;
                    const xOverlap = -1 < dX && dX < 1;
                    const yOverlap = -1 < dY && dY < 1;
                    if (xOverlap && yOverlap) {
                        // console.log("coord.x = " + x + ", coord.y = " + y + ", x = " + x + ", y = " + y + ". Has touched: ", what);
                        return { x: x, y: y };
                    }
                }
            }
        }
        return { x: -1, y: -1 };
    }

    touchesObstacle(coord: Coord): boolean {
        return this.touchesSomething(coord, FieldType.NON_TRAIL).x != -1
            || this.touchesSomething(coord, FieldType.OBSTACLE).x != -1;
    }
    touchesFood(coord: Coord): boolean {
        const food = this.touchesSomething(coord, FieldType.FOOD);
        if (food.x != -1) {
            const x = food.x;
            const y = food.y;
            const m = this._meta.multiplier;
            const field = this._content[y][x];
            const imgBg = new Image();
            imgBg.onload = () => {
                // Drawing the image with coordinates pointing to top-left corner.
                this._ctx.drawImage(imgBg, x * m, y * m, m, m);
            }
            if (field.isTrail) {
                field.type = FieldType.TRAIL;
                imgBg.src = this.imgToPath(ImageType.TRAIL);
            } else {
                field.type = FieldType.NON_TRAIL;
                imgBg.src = this.imgToPath(ImageType.GRASS);
            }
            // TODO: Send update of field to other players.
            return true;
        }
        return false;
    }
}
