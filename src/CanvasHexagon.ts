import { IGeometry } from './Geometry';
import { CellCoordinates, CellData, Center } from './types';
import { ICanvasField } from './IField';
import { ICanvasHexagon, IValueCanvasHexagon } from './IHexagon';
import { BaseHexagon } from './BaseHexagon';

export class CanvasHexagon extends BaseHexagon implements ICanvasHexagon {
    center: Center;

    constructor(
        center: Center,
        private readonly _field: ICanvasField,
        geometry: IGeometry,
        readonly cellCoordinates: CellCoordinates,
        readonly _wrapper: HTMLDivElement,
        value?: number
    ) {
        super(geometry, value);
        this.center = center;
        this.value = value;
    }

    moveTo = ({ y, x }: Center): void => {
        this.center.x = x;
        this.center.y = y;
    };

    draw = () => {
        const { ctx } = this._field;

        const { x, y } = this.center;

        ctx.beginPath();

        this.getHexagonPoints((point) => {
            ctx.lineTo(point.x + x, point.y + y);
        });

        ctx.closePath();
        ctx.stroke();

        ctx.beginPath();

        this.getHexagonPoints((point) => {
            ctx.lineTo(point.x + x, point.y + y);
        }, true);

        ctx.closePath();
        ctx.stroke();

        ctx.fillText(`${this.value || ''}`, x, y);

    };
}

export class ValueHexagon extends CanvasHexagon implements IValueCanvasHexagon {
    value: number;

    constructor(
        center: Center,
        _field: ICanvasField,
        _geometry: IGeometry,
        cellCoordinates: CellCoordinates,
        wrapper: HTMLDivElement,
        value: number
    ) {
        super(center, _field, _geometry, cellCoordinates, wrapper, value);
    }

    toCellData = (): CellData => {
        return {
            ...this.cellCoordinates,
            value: this.value,
        };
    };
}
