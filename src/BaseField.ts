import { IBaseField } from './IField';
import { CanvasHexagon, ValueHexagon } from './CanvasHexagon';
import {
    CellCoordinates,
    CellData,
    Direction,
    GetData,
    HexagonType,
    MapAxisToDirection,
} from './types';
import { IGeometry } from './Geometry';
import {
    IBaseHexagon,
    IBaseValueHexagon,
    ICanvasHexagon,
    IValueCanvasHexagon, IValueSVGHexagon,
} from "./IHexagon";

export class BaseField<
    FieldHexagon extends IBaseHexagon = IBaseHexagon,
    ValueHexagon extends IBaseValueHexagon = IBaseValueHexagon
> implements IBaseField<FieldHexagon, ValueHexagon> {
    private _fieldHexagons: FieldHexagon[] = [];
    valueHexagons: ValueHexagon[] = [];

    get fieldHexagons(): FieldHexagon[] {
        return this._fieldHexagons;
    }
    initField: (getData: GetData) => void;
    removePreviousStuff: () => void;

    constructor(readonly _geometry: IGeometry) {}

    findHexagonUsingCoordinates = <T extends IBaseHexagon>(
        coordinates: CellCoordinates,
        type: HexagonType = HexagonType.Field
    ): T | null => {
        const found = (type === HexagonType.Field
            ? this.fieldHexagons
            : this.valueHexagons
        ).find(
            ({ cellCoordinates: { z, y, x } }) =>
                x === coordinates.x &&
                y === coordinates.y &&
                z === coordinates.z
        );
        return (found as T) || null;
    };

    forEachFieldHexagon = (callback: (hexagon: FieldHexagon) => void) => {
        this._fieldHexagons.forEach((hexagon) => callback(hexagon));
    };

    getHexagonsSortedAlongAxis = (
        axisValue: number,
        axisToDirection: MapAxisToDirection
    ): ValueHexagon[] => {
        return this.valueHexagons
            .filter(
                (hexagon) =>
                    hexagon.cellCoordinates[
                        axisToDirection[Direction.NoMove]
                    ] === axisValue
            )
            .sort((prev, curr) => {
                const prevValue =
                    prev.cellCoordinates[axisToDirection[Direction.Forward]];
                const currentValue =
                    curr.cellCoordinates[axisToDirection[Direction.Forward]];
                if (prevValue < currentValue) return 1;
                if (prevValue === currentValue) return 0;
                return -1;
            });
    };

    placeValueHexagon: (data: CellData) => void;

    removeHexagon = (hexagon: IBaseValueHexagon) => {
        this.valueHexagons = this.valueHexagons.filter(
            (hex) => hex !== hexagon
        );
    };

    initHexagonsLine = (
        getData: GetData,
        callback: (
            cellCoordinates: CellCoordinates,
            offset: { xOffset: number; yOffset: number }
        ) => void
    ) => {
        getData((columnLength, startCoordinates, index) => {
            const {
                getVerticalDistanceToVertex,
                calculateHorizontalOffsetForColumn,
            } = this._geometry;

            for (let i = 1; i <= columnLength; i++) {
                const cellY = startCoordinates.y - i + 1;
                const cellZ = startCoordinates.z + i - 1;

                const xOffset = calculateHorizontalOffsetForColumn(index - 1);

                const yOffsetMultiplier =
                    Math.abs(startCoordinates.x) - 1 + i * 2;

                const yOffset =
                    yOffsetMultiplier * getVerticalDistanceToVertex();
                callback(
                    {
                        x: startCoordinates.x,
                        z: cellZ,
                        y: cellY,
                    },
                    {
                        xOffset,
                        yOffset,
                    }
                );
            }
        });
    };
}
