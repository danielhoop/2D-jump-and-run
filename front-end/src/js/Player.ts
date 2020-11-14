import { GlobalState } from "./GlobalState";

import { Map } from "./Map";
import { constants, PlayerPosition, SocketData, SocketEvent, UserData } from "./types";
import { User } from "./User";

export type Players = Record<string, Player>;

export class Player {

    static PLAYER_1 = 1;
    static PLAYER_2 = 2;
    static PLAYER_3 = 3;
    static OTHER_POTENTIAL_PLAYERS = [2, 3];

    private _MIN_VELOCITY = 1;
    private _MAX_VELOCITY = 4;
    private _MAX_FIELDS_PER_SECOND = constants.MAX_FIELDS_PER_SECOND;
    private _JUMP_DISTANCE = 2.4;
    private _COLLISON_DISTANCE = 2.01;

    private _isActor: boolean;
    private _user: User;
    private _userId: string;
    private _playerNo: number;
    private _yAtLastCollision: number;
    private _yAtLastJump: number;
    private _hasJustCollided = false;
    private _isJumping = false;
    x: number;
    y: number;
    private _reachedGoal = false;
    private _velocity: number;
    private _fps: number;
    private _map: Map;
    private _imgPath: string;
    private _veloImgPath = "./img/velo-points.png";
    private _canvas: HTMLCanvasElement;
    private _ctx: CanvasRenderingContext2D;
    private _veloCtx: CanvasRenderingContext2D;
    private _socket: WebSocket;

    constructor(user: User, playerNo: number, isActor: boolean) {
        this._isActor = isActor;
        this._userId = user.id;
        this._user = user;
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

        this._socket = GlobalState.getInstance().getSocket();
    }

    static createOtherPlayers(players: Array<UserData>): Players {
        if (players && players.length > 0) {
            const otherPlayers: Players = {};
            for (let i = 0; i < Player.OTHER_POTENTIAL_PLAYERS.length && i < players.length; i++) {
                const o = players[i];
                const playerNo = Player.OTHER_POTENTIAL_PLAYERS[i];
                otherPlayers[o.userId] = new Player({ id: o.userId, name: o.name, groupId: o.groupId, roomId: o.roomId }, playerNo, false);
            }
            return otherPlayers;
        }
        return undefined;
    }

    initialize(map: Map, fps: number): void {
        this._map = map;
        this._fps = fps;
        this._reachedGoal = false;
        this._yAtLastCollision = map.getMapData().meta.mapLength + 99;
        this._yAtLastJump = map.getMapData().meta.mapLength + 99;

        const startingPoint = this._map.getStartingPoint();
        this.updatePosition({
            x: startingPoint.x,
            y: startingPoint.y
        });

        if (this._isActor) {
            this.drawVelocity();
        }
    }

    private playerNoToHtml(): string {
        return {
            [Player.PLAYER_1]: "player1",
            [Player.PLAYER_2]: "player2",
            [Player.PLAYER_3]: "player3"
        }[this._playerNo.toString()];
    }
    private playerNoToImagePath(): string {
        return {
            [Player.PLAYER_1]: "./img/hiker-colored.png",
            [Player.PLAYER_2]: "./img/hiker.png",
            [Player.PLAYER_3]: "./img/hiker.png"
        }[this._playerNo.toString()];
    }

    // When the userId is not defined, then it is the own player (not another).
    // In that case, handle collisions, velocity, etc.
    updatePosition(position: PlayerPosition): void {
        if (position.other == undefined || !position.other || position.userId == this._userId) {
            if (this._reachedGoal || position.x >= this._map.getMapData().meta.mapWidth || position.x < 0) {
                return;
            }
            this.x = position.x;
            this.y = position.y;

            // Do this only for received data.
            if (position.other) {
                if (position.yJump) {
                    this._yAtLastJump = position.yJump
                }
                if (position.yColl) {
                    this._yAtLastCollision
                }
            }

            // Reset collision and jumping information.
            this._isJumping = !(this._yAtLastJump - this.y > this._JUMP_DISTANCE);
            this._hasJustCollided = !(this._yAtLastCollision - this.y > this._COLLISON_DISTANCE);

            // Draw the avatar. But only if not passed through goal.
            if (this.y >= 0) {
                this.drawAvatar();
            }

            // If it is not the actor, playing the game, then do not handle collsions.
            if (position.other) {
                return;
            }

            // Handle collisions
            if (!this._isJumping) {
                const playerCoord = { x: this.x, y: this.y };
                if (!this._hasJustCollided && this._map.touchesObstacle(playerCoord)) {
                    this._yAtLastCollision = this.y;
                    this.decreaseVelocity();
                    this._hasJustCollided = true;
                }
                if (this._velocity < this._MAX_VELOCITY && this._map.touchesFood(playerCoord)) {
                    this.increaseVelocity();
                }
            }

            // Send data to other players.
            const posMsg: PlayerPosition = {
                userId: this._userId,
                x: this.x,
                y: this.y,
                other: true
            };
            if (this.y <= 0) {
                this._reachedGoal = true;
                posMsg.goal = true;
                posMsg.userName = this._user.name;
            }
            if (this._yAtLastJump == this.y) {
                posMsg.yJump = this._yAtLastJump;
            }
            if (this._yAtLastCollision == this.y) {
                posMsg.yColl = this._yAtLastCollision;
            }

            const socketMsg: SocketData = {
                type: SocketEvent.POSITION,
                roomId: this._user.roomId,
                payload: posMsg
            };
            this._socket.send(JSON.stringify(socketMsg));
        }
    }

    // moveForward is called for each frame (game loop).
    gameLoop(): void {
        this.moveForward();
        this.drawVelocity();
    }

    private moveForward(): void {
        const position: PlayerPosition = { x: this.x, y: this.y }
        position.y = position.y - (this._velocity / this._MAX_VELOCITY * this._MAX_FIELDS_PER_SECOND / this._fps);
        this.updatePosition(position);
    }
    moveRight(): void {
        const position: PlayerPosition = { x: this.x, y: this.y }
        position.x = position.x + 1;
        this.updatePosition(position);
    }
    moveLeft(): void {
        const position: PlayerPosition = { x: this.x, y: this.y }
        position.x = position.x - 1;
        this.updatePosition(position);
    }
    jump(): void {
        if (!this._isJumping) {
            this._yAtLastJump = this.y;
            // To draw immediately another picture. Even though position has not changed.
            this.updatePosition({ x: this.x, y: this.y });
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
            if (this.y < this._map.getMapData().meta.mapLength - this._MAX_VELOCITY - 3) {
                y = this.y + this._MAX_VELOCITY + 1
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

    private drawAvatar(): void {
        const m = this._map.getMapData().meta.multiplier;
                const img = new Image();
                img.onload = () => {
                    // Drawing the image with coordinates pointing to top-left corner.
                    this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
                    if (this._isJumping) {
                        // Shadow below figure. Figure is slightly larger than usually.
                        this._ctx.fillStyle = "gray";
                        this._ctx.fillRect(this.x * m - m * 0.40, this.y * m - m * 0.40, m * 1.60, m * 1.60);
                        this._ctx.drawImage(img, this.x * m - m * 0.20, this.y * m - m * 0.20, m * 1.20, m * 1.20);
                    } else {
                        // Normal sized figure.
                        this._ctx.drawImage(img, this.x * m, this.y * m, m, m);
                    }
                }
                img.src = this._imgPath;
    }
}