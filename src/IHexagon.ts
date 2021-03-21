import { CellCoordinates, CellData, Center } from './types';

export interface IBaseHexagon {
    cellCoordinates: CellCoordinates;
    isEqualCoordinates: (coordinates: CellCoordinates) => boolean;
    center: Center;
    getHexagonPoints: (
        callback: (point: { x: number; y: number }) => void,
        insidePath?: boolean
    ) => void;
}

export interface IBaseValueHexagon extends IBaseHexagon {
    value: number;
    toCellData: () => CellData;
}

export interface ICanvasHexagon extends IBaseHexagon {
    moveTo: (coordinates: Center) => void;
    draw: () => void;
}

export interface IValueCanvasHexagon extends ICanvasHexagon {
    value: number;
    toCellData: () => CellData;
}

export interface ISVGHexagon extends IBaseHexagon {
    draw: () => HTMLOrSVGElement;
    svg: SVGSVGElement;
    cleanDataset: () => void;
    updateDataset: () => void;
    update: () => void;
    playAnimation: () => void;
}

export interface IValueSVGHexagon extends ISVGHexagon {
    value: number;
    toCellData: () => CellData;
}
