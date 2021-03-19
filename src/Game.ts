import {
    CellCoordinates,
    CellData,
    Direction,
    GameKey,
    GameStatus,
    HexagonType,
} from './types';
import { gameKeys, keyMap } from './consts';
import { IDataFetcher } from './DataFetcher';
import { IBaseField } from './IField';
import { IBaseValueHexagon, IValueCanvasHexagon } from './IHexagon';

export interface IGame {
    data: CellData[];
    gameStatus: GameStatus;

    gameRadius: number;

    getAxisSideCoordinates: (
        gameKey: GameKey,
        mainAxisValue: number
    ) => CellCoordinates;

    goThroughField: (
        callback: (axisValue: number, index: number) => void
    ) => void;
    isGameKeyPressed: (key: string) => key is GameKey;

    goAlongXAxis: (
        callback: (length: number, cell: CellCoordinates, index: number) => void
    ) => void;

    updateGameStatus: (field: IBaseField) => void;
    mainEventListener: (
        event: KeyboardEvent,
        field: IBaseField,
        dataFetcher: IDataFetcher
    ) => void;
}

export class Game implements IGame {
    private isTurnProcessing = false;
    private _data: CellData[] = [];
    gameStatus = GameStatus.PLAYING;

    get data(): CellData[] {
        return this._data;
    }

    set data(value: CellData[]) {
        this._data = value;
    }

    constructor(readonly gameRadius: number, private _onGameOver: () => void) {}

    getUpdatedHexagonsLine = (
        key: GameKey,
        field: IBaseField
    ): [IBaseValueHexagon[], boolean] => {
        const axisToDirection = keyMap[key];

        const result: IBaseValueHexagon[] = [];

        let hasChanges = false;

        this.goThroughField((axisValue) => {
            const lineHexagons = field.getHexagonsSortedAlongAxis(
                axisValue,
                axisToDirection
            );

            const axisSideCoordinates = this.getAxisSideCoordinates(
                key,
                axisValue
            );

            for (let i = 0, limit = lineHexagons.length - 1; i <= limit; i++) {
                const current = lineHexagons[i];
                const next = lineHexagons[i + 1];

                if (!current.isEqualCoordinates(axisSideCoordinates)) {
                    hasChanges = true;
                }
                current.cellCoordinates = { ...axisSideCoordinates };
                axisSideCoordinates[axisToDirection[Direction.Forward]] -= 1;
                axisSideCoordinates[axisToDirection[Direction.Backward]] += 1;
                if (next && next.value === current.value) {
                    next.cellCoordinates = {
                        ...current.cellCoordinates,
                    };
                    lineHexagons.splice(i, 1);
                    next.value *= 2;
                    limit--;

                    hasChanges = true;
                }
            }
            result.push(...lineHexagons);
        });
        return [result, hasChanges];
    };

    mainEventListener = async (
        { key }: KeyboardEvent,
        field: IBaseField,
        dataFetcher: IDataFetcher
    ) => {
        if (this.isGameKeyPressed(key) && !this.isTurnProcessing) {
            try {
                this.isTurnProcessing = true;
                const [result, hasChanges] = this.getUpdatedHexagonsLine(
                    key,
                    field
                );

                if (hasChanges) {
                    await field.updateHexagonsPosition(result);
                    this.data = field.valueHexagons.map((hexagon) =>
                        hexagon.toCellData()
                    );
                    await dataFetcher.getDataFromServer();
                    // field.updateDomElements();
                }
            } catch (error) {
                console.error({ error });
            } finally {
                this.isTurnProcessing = false;
            }
        }
    };

    _goAlongAxis = (
        gameKey: GameKey,
        callback: (length: number, cell: CellCoordinates, index: number) => void
    ) => {
        this.goThroughField((axisValue, index) => {
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

    goThroughField = (
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

    updateGameStatus = (field: IBaseField): void => {
        if (field.fieldHexagons.length !== field.valueHexagons.length) {
            return;
        }
        const isGameOver = gameKeys.every((gameKey) => {
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
                    const current = field.findHexagonUsingCoordinates<IValueCanvasHexagon>(
                        coordinates,
                        HexagonType.Value
                    );
                    const nextCoordinates = { ...coordinates };

                    nextCoordinates[axisToDirection[Direction.Forward]]--;
                    nextCoordinates[axisToDirection[Direction.Backward]]++;

                    const next = field.findHexagonUsingCoordinates<IValueCanvasHexagon>(
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
        if (isGameOver) {
            this._onGameOver()
        }
    };
}
