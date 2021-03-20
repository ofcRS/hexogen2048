import {
    CellCoordinates,
    CellData,
    HexagonType,
    MapAxisToDirection,
} from './types';
import {
    IBaseHexagon,
    IBaseValueHexagon,
    ICanvasHexagon,
    ISVGHexagon,
    IValueCanvasHexagon,
    IValueSVGHexagon,
} from './IHexagon';

export interface IBaseField<
    FieldHexagon extends IBaseHexagon = IBaseHexagon,
    ValueHexagon extends IBaseValueHexagon = IBaseValueHexagon
> {
    forEachFieldHexagon: (callback: (hexagon: IBaseHexagon) => void) => void;
    placeValueHexagon: (coordinates: CellData) => void;

    findHexagonUsingCoordinates: <T extends IBaseHexagon>(
        coordinates: CellCoordinates,
        where?: HexagonType
    ) => null | T;

    fieldHexagons: FieldHexagon[];
    valueHexagons: ValueHexagon[];

    getHexagonsSortedAlongAxis: (
        axisValue: number,
        axisToDirection: MapAxisToDirection
    ) => ValueHexagon[];

    removeHexagon: (hexagon: ValueHexagon) => void;

    initField: (
        getData: (
            callback: (
                columnLength: number,
                cellCoordinates: CellCoordinates,
                index: number
            ) => void
        ) => void
    ) => void;

    removePreviousStuff: () => void;

    updateHexagonsPosition: (hexagons: ValueHexagon[]) => Promise<unknown | void>;

    moveHexagon: (hexagon: ValueHexagon, newCenter: CellCoordinates) => void;
    updateDomElements: () => void;
}

export interface ICanvasField
    extends IBaseField<ICanvasHexagon, IValueCanvasHexagon> {
    ctx: CanvasRenderingContext2D;
    clearContext: () => void;
    redraw: () => void;
}

export interface ISVGField
    extends IBaseField<ISVGHexagon, IValueSVGHexagon> {
}
