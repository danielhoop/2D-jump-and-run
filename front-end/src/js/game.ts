import mapCreator from "./map-creator";


const game = function() {
    //         mapLength, mapWidth, trailWidth, multiplier, dir, stone, animal, food
    mapCreator( 40,       10,       2,          20,         1.0, 0.0,   0.0,    0.0);
}


export default game;