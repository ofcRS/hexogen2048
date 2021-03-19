import { CellCoordinates, CellData, Center, Offset } from './types';

export interface IBaseHexagon {
    cellCoordinates: CellCoordinates;
    isEqualCoordinates: (coordinates: CellCoordinates) => boolean;
    center: Center;
    update: () => void;

    cleanDataset: () => void;
    updateDataset: () => void;
}

export interface IBaseValueHexagon extends IBaseHexagon {
    value: number;
    toCellData: () => CellData;
}

export interface ICanvasHexagon extends IBaseHexagon {
    moveTo: (coordinates: Center) => void;
    getDomNode: () => HTMLDivElement | null;
    updateDataset: () => void;
    initDomNode: () => void;
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
}

export interface IValueSVGHexagon extends ISVGHexagon {
    value: number;
}
