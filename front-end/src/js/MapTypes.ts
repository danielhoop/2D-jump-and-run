export interface MapData {
    content: MapContent,
    meta: MapMetaData
}

export type MapContent = Array<Array<Field>>;

export enum FieldType {
    TRAIL = "TRAIL",
    NON_TRAIL = "NON_TRAIL",
    OBSTACLE = "OBSTACLE",
    FOOD = "FOOD"
}

export enum ImageType {
    TRAIL = "TRAIL",
    GRASS = "GRASS",
    STONE = "STONE",
    BIRD1 = "BIRD1",
    BIRD2 = "BIRD2",
    APPLE = "APPLE",
    BANANA = "BANANA"
}

export interface Field {
    isTrail: boolean,
    type: FieldType,
    image: ImageType
}

export interface Coord {
    x: number,
    y: number
}


// mapLength: length of map
// mapWidth: width of map
// trailWidth: width of trail
// multiplier: pixel multiplier. Size of one square.
// dir: probability of change in direction.
// stone: probability of stone.
// animal: probability of animal.
// food: probability of food.
export interface MapMetaData {
    mapLength: number,
    mapWidth: number,
    trailWidth: number,
    multiplier: number
    dir: number,
    stone: number,
    animal: number,
    food: number
}
