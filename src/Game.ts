import { IHexagon } from './Hexagon';
import {
    Axis,
    CellCoordinates,
    Direction,
    GameKey,
    MapAxisToDirection,
} from './types';
import { keyMap } from './consts';

export type CellData = {
    x: number;
    y: number;
    z: number;
    value: number;
    hexagon: IHexagon;
};

export interface IGame {
    data: CellData[];

    gameRadius: number;

    moveAlongAxis: (
        gameKey: GameKey,
        cellCoordinates: CellCoordinates
    ) => CellCoordinates;
}

export class Game implements IGame {
    axes: Axis[] = [Axis.X, Axis.Y, Axis.Z];

    data: CellData[] = [];

    constructor(readonly gameRadius: number) {}

    getSideCoordinates = (center: number) => {
        return this.gameRadius - 1 - Math.abs(center);
    };

    moveAlongAxis = (
        gameKey: GameKey,
        cellCoordinates: CellCoordinates
    ): CellCoordinates => {
        const axisToDirection = keyMap[gameKey];

        const result = {} as CellCoordinates;

        const mainAxisValue = cellCoordinates[axisToDirection[Direction.NoMove]];

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

        /*const filtered = this.axes.filter((a) => a !== gameKey);
        const result = {} as CellCoordinates;

        if (axisValue > 0) {
            if (direction === Direction.Backward) {
                result[filtered[0]] = -(this.gameRadius - 1);
                result[filtered[1]] = this.gameRadius - 1 - Math.abs(axisValue);
            } else {
                result[filtered[0]] = -(this.gameRadius - 1 - Math.abs(axisValue));
                result[filtered[1]] = this.gameRadius - 1;
            }
        } else {
            if (direction === Direction.Backward) {
                result[filtered[0]] = this.gameRadius - 1;
                result[filtered[1]] = -(this.gameRadius - 1 - Math.abs(axisValue));
            } else {
                result[filtered[0]] = this.gameRadius - 1 - Math.abs(axisValue);
                result[filtered[1]] = -(this.gameRadius - 1);
            }
        }

        result[gameKey] = axisValue;

        return result;*/
    };
}
