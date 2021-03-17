import { IHexagon } from './Hexagon';
import {
    Axis,
    CellCoordinates,
    CellData,
    Direction,
    GameKey,
    MapAxisToDirection,
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
        gameKey: GameKey,
        callback: (axisValue: number) => void
    ) => void;
    isGameKeyPressed: (key: string) => key is GameKey;
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

    getSideCoordinates = (center: number) => {
        return this.gameRadius - 1 - Math.abs(center);
    };

    isGameKeyPressed = (key: string): key is GameKey => gameKeys.includes(key);

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
        gameKey: GameKey,
        callback: (axisValue: number) => void
    ) => {
        const { gameRadius } = this;
        const axisToDirection = keyMap[gameKey];

        // for (let i = -gameRadius + 1; i < gameRadius; i++) {
        //     console.log(2 * gameRadius - Math.abs(i));
        // }
        for (let i = -gameRadius + 1; i < gameRadius; i++) {
            callback(i);
            const sideCoordinates = this.getAxisSideCoordinates(gameKey, i);

            const lengthOfLine = 2 * gameRadius - Math.abs(i) - 1;
            let maxOffset = sideCoordinates[axisToDirection[Direction.Forward]];
            let minOffset = maxOffset - lengthOfLine + 1;

            for (let j = 1; j <= lengthOfLine; j++, maxOffset--, minOffset++) {
                // callback({
                //     [axisToDirection[Direction.Forward]]: maxOffset,
                //     [axisToDirection[Direction.NoMove]]: i,
                //     [axisToDirection[Direction.Backward]]: minOffset,
                // } as CellCoordinates);
            }
        }
    };
}
