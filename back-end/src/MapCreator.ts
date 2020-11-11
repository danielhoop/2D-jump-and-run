import { MapMetaData, MapContent, ImageType, Field, FieldType } from "./MapTypes";

export const mapLevelMetaData: Array<MapMetaData> = [
    // Settings for 5 levels.
    { mapLength: 100, mapWidth: 20, trailWidth: 4, multiplier: 40, dir: 0.8, stone: 0.05, animal: 0.03, food: 0.12 },
    { mapLength: 100, mapWidth: 20, trailWidth: 3, multiplier: 40, dir: 0.7, stone: 0.08, animal: 0.04, food: 0.10 },
    { mapLength: 100, mapWidth: 20, trailWidth: 3, multiplier: 40, dir: 0.8, stone: 0.09, animal: 0.05, food: 0.08 },
    { mapLength: 100, mapWidth: 20, trailWidth: 3, multiplier: 40, dir: 1.0, stone: 0.10, animal: 0.05, food: 0.06 },
    { mapLength: 100, mapWidth: 20, trailWidth: 2, multiplier: 40, dir: 1.0, stone: 0.10, animal: 0.05, food: 0.06 },
]

export const createMap = function (param: MapMetaData): MapContent {
    const { mapLength, mapWidth, trailWidth, dir, stone, animal, food } = param;

    const MARGIN = 0;
    const TRAIL = ImageType.TRAIL;
    const GRASS = ImageType.GRASS;
    const STONE = ImageType.STONE;
    const BIRD1 = ImageType.BIRD1;
    const BIRD2 = ImageType.BIRD2;
    const APPLE = ImageType.APPLE;
    const BANANA = ImageType.BANANA;

    const create = function (img: ImageType, x: number, y: number, isTrail = false): Field {
        let type: FieldType;
        if (img === GRASS) {
            type = FieldType.NON_TRAIL;
        } else if (img === APPLE || img === BANANA) {
            type = FieldType.FOOD;
        } else if (img === TRAIL) {
            type = FieldType.TRAIL;
        } else {
            type = FieldType.OBSTACLE;
        }

        return {
            isTrail: isTrail || img === TRAIL,
            type: type,
            image: img
        };
    }

    const createRandomElement = function (alternative: ImageType, x: number, y: number, isTrail = false): Field {
        if (Math.random() <= stone) {
            return create(STONE, x, y, isTrail);

        } else if (Math.random() <= animal) {
            if (Math.random() <= 0.5) {
                return create(BIRD1, x, y, isTrail);
            }
            return create(BIRD2, x, y, isTrail);

        } else if (Math.random() <= food) {
            if (Math.random() <= 0.5) {
                return create(APPLE, x, y, isTrail);
            }
            return create(BANANA, x, y, isTrail);
        }
        return create(alternative, x, y, isTrail);
    }

    const mp: Array<Array<Field>> = [];
    const trailWidthShould = trailWidth;

    const wentLeft = [false, false];
    const wentRight = [false, false];

    let trailContinuationLast = [];
    for (let i = 0; i < mapWidth; i++) {
        trailContinuationLast[i] = false;
    }

    for (let y = 0; y < mapLength; y++) {
        let trailWidthIs = 0;

        let changeDir = false;

        const trailContinuationThis = [];
        for (let i = 0; i < mapWidth; i++) {
            trailContinuationThis[i] = false;
        }

        const line: Array<Field> = [];

        // First line is special. Trail is located in the middle.
        if (y == 0) {
            const midPoint = Math.round(mapWidth / 2);
            for (let x = 0; x < mapWidth; x++) {
                if (x < midPoint) {
                    line[x] = createRandomElement(GRASS, x, y);
                } else if (x == midPoint) {
                    line[x] = create(TRAIL, x, y);
                    trailContinuationThis[x] = true;
                    trailWidthIs++;
                } else {
                    // This case cannot be collapsed with case (x == midPoint) !!!
                    if (trailWidthIs < trailWidthShould) {
                        line[x] = create(TRAIL, x, y);
                        trailContinuationThis[x] = true;
                        trailWidthIs++;
                    } else {
                        line[x] = createRandomElement(GRASS, x, y);
                    }
                }
            }

            // Copy last trail.
        } else if (y % trailWidth != 0) {
            const lastLine = mp[y - 1];
            for (let x = 0; x < mapWidth; x++) {
                if (lastLine[x].isTrail) {
                    line[x] = createRandomElement(TRAIL, x, y, true);
                } else {
                    line[x] = createRandomElement(GRASS, x, y);
                }
                trailContinuationThis[x] = trailContinuationLast[x];
            }

            // Decide about new trail direction.
        } else {
            let goLeft = false;
            let goRight = false;
            changeDir = Math.random() <= dir;
            // Direction should be canged
            if (changeDir) {
                // If the last one was to the left, but the former wasn't, then don't go to the right.
                if (wentLeft[wentLeft.length - 1] && !wentLeft[wentLeft.length - 2]) {
                    goLeft = true;
                    // If the last one was to the right, but the former wasn't, then don't go to the left.
                } else if (wentRight[wentRight.length - 1] && !wentRight[wentRight.length - 2]) {
                    goRight = true;
                } else {
                    goLeft = Math.random() < 0.5;
                    goRight = !goLeft;
                }
                if (goLeft) {
                    wentLeft.push(true);
                    wentRight.push(false);
                } else if (goRight) {
                    wentLeft.push(false);
                    wentRight.push(true);
                }
                // Direction should not be changed.
            } else {
                wentLeft.push(false);
                wentRight.push(false);
            }

            // Loop over all x
            for (let x = 0; x < mapWidth; x++) {
                line[x] = createRandomElement(GRASS, x, y);
                if (goLeft) {
                    if (x + trailWidth <= (mapWidth - 1) && trailContinuationLast[x + trailWidth]) {
                        line[x] = createRandomElement(TRAIL, x, y, true);
                        trailContinuationThis[x] = true;
                        //console.log("x = " + x + ", has happened! 1.1");
                    } else if (trailContinuationLast[x]) {
                        line[x] = createRandomElement(TRAIL, x, y, true);
                        if (x - trailWidth < MARGIN) {
                            wentLeft[wentLeft.length] = false;
                            trailContinuationThis[x] = true;
                            //console.log("x = " + x + ", has happened! 1");
                        }
                    }
                } else if (goRight) {
                    if (trailContinuationLast[x]) {
                        line[x] = createRandomElement(TRAIL, x, y, true);
                        if (x + trailWidth > mapWidth - 1 + MARGIN) {
                            wentRight[wentRight.length] = false;
                            trailContinuationThis[x] = true;
                            //console.log("x = " + x + ", has happened! 2");
                        }
                    } else if (x - trailWidth >= MARGIN && trailContinuationLast[x - trailWidth]) {
                        line[x] = createRandomElement(TRAIL, x, y, true);
                        trailContinuationThis[x] = true;
                        //console.log("x = " + x + ", has happened! 2.1");
                    }
                } else {
                    if (trailContinuationLast[x]) {
                        //console.log("x = " + x + ", has happened! 3");
                        line[x] = createRandomElement(TRAIL, x, y, true);
                        trailContinuationThis[x] = true;
                    }
                }
            }
        }
        //console.log(trailContinuationThis); console.log(line);
        trailContinuationLast = trailContinuationThis;
        mp[y] = line;
    }

    // Make map upside down
    const mpInv: Array<Array<Field>> = [];
    const subtr = mapLength - 1;
    for (let y = 0; y < mapLength; y++) {
        mpInv[y] = mp[subtr - y];
    }

    return mpInv;
}
