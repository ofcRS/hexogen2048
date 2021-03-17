import { IField } from './Field';
import { IGeometry } from './Geometry';
import { IGame } from './Game';
import { Axis, CellCoordinates, CellData } from './types';

type Center = { x: number; y: number };

export interface IHexagon {
    draw: () => void;
    moveTo: (coordinates: Center) => void;
    cellCoordinates: CellCoordinates;
    center: Center;
    isEqualCoordinates: (coordinates: CellCoordinates) => boolean;
}

export interface IValueHexagon extends IHexagon {
    value: number;
    toCellData: () => CellData;
}

export class Hexagon implements IHexagon {
    private prevValue = 0;
    private direction = true;
    private readonly _step = 20;
    center: Center;
    value?: number;

    constructor(
        center: Center,
        private readonly _field: IField,
        private readonly _geometry: IGeometry,
        private readonly _game: IGame,
        readonly cellCoordinates: CellCoordinates,
        value?: number
    ) {
        this.center = center;
        this.value = value;
    }

    isEqualCoordinates = (coordinates: CellCoordinates) => {
        return (Object.keys(coordinates) as Axis[]).every(
            (key) => coordinates[key] === this.cellCoordinates[key]
        );
    };

    moveTo = ({ y, x }: Center): void => {
        this.center.x = x;
        this.center.y = y;
    };

    draw = () => {
        const {
            getVerticalDistanceToVertex,
            getHorizontalDistanceToVertex,
        } = this._geometry;

        const { ctx } = this._field;

        const { x, y } = this.center;

        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const xPoint = x + getHorizontalDistanceToVertex(i * 60);
            const yPoint = y + getVerticalDistanceToVertex(i * 60);

            ctx.lineTo(xPoint, yPoint);
        }

        ctx.closePath();
        ctx.stroke();

        ctx.fillText(`${this.value || ''}`, x, y);

        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const xPoint = x + getHorizontalDistanceToVertex(i * 60, true);
            const yPoint = y + getVerticalDistanceToVertex(i * 60, true);

            ctx.lineTo(xPoint, yPoint);
        }

        ctx.closePath();
        ctx.stroke();
    };
}

export class ValueHexagon extends Hexagon implements IValueHexagon {
    value: number;

    constructor(
        center: Center,
        _field: IField,
        _geometry: IGeometry,
        _game: IGame,
        cellCoordinates: CellCoordinates,
        value: number
    ) {
        super(center, _field, _geometry, _game, cellCoordinates, value);
        this.value = value;
    }

    toCellData = (): CellData => {
        return {
            ...this.cellCoordinates,
            value: this.value,
        };
    };
}
