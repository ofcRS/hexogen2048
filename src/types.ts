export enum Axis {
    X = 'x',
    Y = 'y',
    Z = 'z',
}

export enum Direction {
    Forward,
    Backward,
    NoMove
}

export type CellCoordinates = {
    x: number;
    y: number;
    z: number;
};

export enum HexagonType {
    Field,
    Value,
}

export type MapAxisToDirection = Record<Direction, Axis>

export enum GameKey {
    Q = 'q',
    D = 'd',
    W = 'w',
    S = 's',
    E = 'e',
    A = 'a',
}
