// mapLength: length of map
// mapWidth: width of map
// trailWidth: width of trail
// multiplier: pixel multiplier. Size of one square.
// dir: probability of change in direction.
// stone: probability of stone.
// animal: probability of animal.
// food: probability of food.

mapCreator = function (mapLength, mapWidth, trailWidth, multiplier, dir, stone, animal, food) {
    const MARGIN = 0;
    const TRAIL = "../img/trail.png";
    const GRASS = "../img/grass.png";
    const STONE = "../img/stone.png";
    const BIRD1 = "../img/bird-1.png";
    const BIRD2 = "../img/bird-2.png";
    const APPLE = "../img/apple.png";
    const BANANA = "../img/banana.png";

    create = function (backgroundPath, x, y, isTrail = false) {
        return {
            isTrail: isTrail || backgroundPath === TRAIL,
            background: backgroundPath,
            y: y,
            x: x,
            width: multiplier,
            height: multiplier
        };
    }

    createRandomElement = function (alternative, x, y, isTrail = false) {
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

    const mp = [];
    const trailWidthShould = trailWidth;

    let wentLeft = [false, false];
    let wentRight = [false, false];

    let trailContinuationLast = [];
    for (let i = 0; i < mapWidth; i++) {
        trailContinuationLast[i] = false;
    }

    for (var y = 0; y < mapLength; y++) {
        let trailWidthIs = 0;

        let changeDir = false;

        const trailContinuationThis = [];
        for (let i = 0; i < mapWidth; i++) {
            trailContinuationThis[i] = false;
        }

        let line = [];

        // First line is special. Trail is located in the middle.
        if (y == 0) {
            var midPoint = Math.round(mapWidth / 2);
            for (var x = 0; x < mapWidth; x++) {
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
            for (var x = 0; x < mapWidth; x++) {
                if (lastLine[x].isTrail) {
                    line[x] = createRandomElement(TRAIL, x, y, true);
                } else {
                    line[x] = createRandomElement(GRASS, x, y);
                }
                trailContinuationThis[x] = trailContinuationLast[x];
            }

            // Decide about new trail direction.
        } else {
            const lastLine = mp[y - 1];
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
            for (var x = 0; x < mapWidth; x++) {
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

    console.log(mp);
}