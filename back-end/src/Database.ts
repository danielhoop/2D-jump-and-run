import sql from "sqlite3";
import sqlSync from "better-sqlite3";

import { GameEvent, Scores } from "./types";
sql.verbose();

export default class Database {

    private FILENAME = "data.sqlite"; // ":memory:" would be in memory.
    private db: sql.Database;

    constructor() {
        const db = this.openConnection();

        console.log("**************************************************************************");
        console.log("You can safely ignore errors like 'SQLITE_ERROR: table ... already exists'");
        console.log("**************************************************************************");

        db.run(
            'CREATE TABLE gameEvent ' +
            '(eventId INTEGER PRIMARY KEY, userId TEXT, type INTEGER, x REAL, y REAL, timestamp INTEGER)',
            (err: any) => {
                if (err) {
                    // Do nothing. In that case, the table already exists.
                    console.log("Error trying to create table 'gameEvent': " + err.message);
                }
            }
        );
        db.run(
            'CREATE TABLE room ' +
            '(roomId TEXT PRIMARY KEY, winnerId TEXT, winnerTime INTEGER, startTimestamp INTEGER, endTimestamp INTEGER)',
            (err: any) => {
                if (err) {
                    // Do nothing. In that case, the table already exists.
                    console.log("Error trying to create table 'room': " + err.message);
                }
            }
        );
        db.run(
            'CREATE TABLE score (' +
            'userId TEXT, roomId TEXT, userName TEXT, totalTime INTEGER, ' +
            'PRIMARY KEY (userId, roomId), ' +
            'FOREIGN KEY (roomId) REFERENCES room(roomId)' +
            ')',
            (err: any) => {
                if (err) {
                    // Do nothing. In that case, the table already exists.
                    console.log("Error trying to create table 'score': " + err.message);
                }
            }
        );
        db.close();

        /*
        this.addRoom("1", 1);
        this.addScore("9", "Daniel", 9000, "1");
        this.addWinnerToRoom("9", 9000, 2, "1");
        this.addGameEvent("9", 1, 999);
        */
    }

    private openConnection(): sql.Database {
        return new sql.Database(this.FILENAME, (err: any) => {
            if (err) {
                return console.error(`Error trying to connect to database (file: '${this.FILENAME}'): ` + err.message);
            }
        });
    }

    private openSyncConnection(): sqlSync.Database {
        return new sqlSync(this.FILENAME);
    }

    addRoom(roomId: string, startTimestamp: number): void {
        const db = this.openConnection();
        const qu = "INSERT INTO room (roomId, startTimestamp) VALUES (?, ?)";
        db.run(qu, [roomId, startTimestamp], (err: any) => {
            if (err) {
                return console.error("Error trying to add a room: " + err.message);
            }
        })
        db.close();
    }

    addWinnerToRoom(winnerId: string, winnerTime: number, endTimestamp: number, roomId: string): void {
        const db = this.openConnection();
        const qu = "UPDATE room SET winnerId = ?, winnerTime = ?, endTimeStamp = ? WHERE roomId = " + roomId;
        db.run(qu, [winnerId, winnerTime, endTimestamp], (err: any) => {
            if (err) {
                return console.error("Error trying to add a winner to a room: " + err.message);
            }
        })
        db.close();
    }

    addScore(userId: string, userName: string, totalTime: number, roomId: string): void {
        const db = this.openConnection();
        const qu = "INSERT INTO score (userId, roomId, userName, totalTime) VALUES (?, ?, ?, ?)";
        db.run(qu, [userId, roomId, userName, totalTime], (err: any) => {
            if (err) {
                return console.error("Error trying to add a score: " + err.message);
            }
        })
        db.close();
    }

    addGameEvent(userId: string, type: GameEvent, x: number, y: number, timestamp: number): void {
        const db = this.openConnection();
        const qu = "INSERT INTO gameEvent (userId, type, x, y, timestamp) VALUES (?, ?, ?, ?, ?)";
        db.run(qu, [userId, type, x, y, timestamp], (err: any) => {
            if (err) {
                return console.error("Error trying to add a gameEvent: " + err.message);
            }
        })
        db.close();
    }

    getBestScoresEver(howMany = 10): Scores {
        const sql = "SELECT userId, userName as 'name', totalTime FROM score ORDER BY totalTime ASC LIMIT " + howMany + ";"
        const db = this.openSyncConnection();
        const scores = db.prepare(sql).all();
        db.close();
        return scores;
    }
    /*
    console.log("Does the score table exist? " + this.doesTableExist(db, "score"));
    private doesTableExist(db: sql.Database, tableName: string): boolean {
        const sql = "SELECT name FROM sqlite_master WHERE type='table' AND name='?';"
        const params = tableName;
        let exists = false;

        db.get(sql, params, (err, row) => {
            if (err) {
                return console.error("Error message in doesTableExist: " + err.message);
            }
            console.log(row);
            if (row) {
                exists = true;
            }
        });

        return exists;
    }
    */



}