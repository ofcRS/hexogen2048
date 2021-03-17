import { IValueHexagon } from './Hexagon';
import {
    CellCoordinates,
    CellData,
    Direction,
    GameKey,
    HexagonType,
} from './types';
import { gameKeys, keyMap } from './consts';
import { IField } from './Field';

export interface IGame {
    data: CellData[];

    gameRadius: number;

    getAxisSideCoordinates: (
        gameKey: GameKey,
        mainAxisValue: number
    ) => CellCoordinates;

    goThroughAllFields: (
        callback: (axisValue: number, index: number) => void
    ) => void;
    isGameKeyPressed: (key: string) => key is GameKey;

    goAlongXAxis: (
        callback: (length: number, cell: CellCoordinates, index: number) => void
    ) => void;

    isGameOver: (field: IField) => boolean;
}

export class Game implements IGame {
    private _data: CellData[] = [];

    get data(): CellData[] {
        return this._data;
    }

    set data(value: CellData[]) {
        this._data = value;
    }

    constructor(readonly gameRadius: number) {}

    _goAlongAxis = (
        gameKey: GameKey,
        callback: (length: number, cell: CellCoordinates, index: number) => void
    ) => {
        this.goThroughAllFields((axisValue, index) => {
            const columnLength = 2 * this.gameRadius - Math.abs(axisValue) - 1;
            const sideCoordinates = this.getAxisSideCoordinates(
                gameKey,
                axisValue
            );
            callback(columnLength, sideCoordinates, index);
        });
    };

    goAlongXAxis = (
        callback: (length: number, cell: CellCoordinates, index: number) => void
    ) => this._goAlongAxis(GameKey.W, callback);

    getSideCoordinates = (center: number) => {
        return this.gameRadius - 1 - Math.abs(center);
    };

    isGameKeyPressed = (key: string): key is GameKey =>
        gameKeys.includes(key as GameKey);

    getAxisSideCoordinates = (
        gameKey: GameKey,
        mainAxisValue: number
    ): CellCoordinates => {
        const axisToDirection = keyMap[gameKey];

        const result = {} as CellCoordinates;

        result[axisToDirection[Direction.NoMove]] = mainAxisValue;

        if (mainAxisValue > 0) {
            result[
                axisToDirection[Direction.Forward]
            ] = this.getSideCoordinates(mainAxisValue);
            result[axisToDirection[Direction.Backward]] = -(
                this.gameRadius - 1
            );
        } else {
            result[axisToDirection[Direction.Forward]] = this.gameRadius - 1;
            result[
                axisToDirection[Direction.Backward]
            ] = -this.getSideCoordinates(mainAxisValue);
        }

        return result;
    };

    goThroughAllFields = (
        callback: (axisValue: number, index: number) => void
    ): void => {
        const { gameRadius } = this;

        for (
            let axisValue = -gameRadius + 1, i = 0;
            axisValue < gameRadius;
            axisValue++, i++
        ) {
            callback(axisValue, i);
        }
    };

    isGameOver = (field: IField): boolean => {
        if (field.fieldHexagons.length !== field.valueHexagons.length) {
            return false;
        }
        return gameKeys.every((gameKey) => {
            const axisToDirection = keyMap[gameKey];
            let hasSameValueNeighbors = false;
            this._goAlongAxis(gameKey, (length, cell, index) => {
                const coordinates = { ...cell };

                coordinates[axisToDirection[Direction.Backward]] =
                    coordinates[axisToDirection[Direction.Forward]] -
                    length +
                    1;

                for (
                    let j = 0;
                    j < length - 1;
                    j++,
                        coordinates[axisToDirection[Direction.Forward]]--,
                        coordinates[axisToDirection[Direction.Backward]]++
                ) {
                    const current = field.findHexagonUsingCoordinates<IValueHexagon>(
                        coordinates,
                        HexagonType.Value
                    );
                    const nextCoordinates = { ...coordinates };

                    nextCoordinates[axisToDirection[Direction.Forward]]--;
                    nextCoordinates[axisToDirection[Direction.Backward]]++;

                    const next = field.findHexagonUsingCoordinates<IValueHexagon>(
                        nextCoordinates,
                        HexagonType.Value
                    );

                    if (current?.value === next?.value) {
                        hasSameValueNeighbors = true;
                    }
                }
            });
            return !hasSameValueNeighbors;
        });
    };
}
