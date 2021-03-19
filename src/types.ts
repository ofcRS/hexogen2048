export enum Axis {
    X = 'x',
    Y = 'y',
    Z = 'z',
}

export enum Direction {
    Forward,
    Backward,
    NoMove,
}

export type CellCoordinates = {
    x: number;
    y: number;
    z: number;
};

export type CellData = CellCoordinates & {
    value: number;
};

export enum HexagonType {
    Field,
    Value,
}

export type MapAxisToDirection = Record<Direction, Axis>;

export enum GameKey {
    Q = 'q',
    D = 'd',
    W = 'w',
    S = 's',
    E = 'e',
    A = 'a',
}

export enum GameStatus {
    PLAYING = 'playing',
    OVER = 'game-over',
}

export enum GraphicType {
    CANVAS = 'canvas',
    SVGELEMENTS = 'svgElements',
}

export type Center = { x: number; y: number };

export type GetData = (
    callback: (
        columnLength: number,
        cellCoordinates: CellCoordinates,
        index: number
    ) => void
) => void;

export type Offset = {
    xOffset: number;
    yOffset: number;
};
