import { IGeometry } from './Geometry';
import { Axis, CellCoordinates, CellData, Center } from './types';
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

        ctx.fillText(`${this.value || ''}`, x, y);
    };

    initDomNode = () => {
        const { y, z, x } = this.cellCoordinates;
        const dataNode = document.createElement('div');
        dataNode.dataset.x = `${x}`;
        dataNode.dataset.y = `${y}`;
        dataNode.dataset.z = `${z}`;
        dataNode.dataset.value = '0';
        this._wrapper.appendChild(dataNode);
    };

    getDomNode = (): HTMLDivElement | null => {
        const { y, z, x } = this.cellCoordinates;
        const relativeNode = document.querySelector(
            `[data-x="${x}"][data-y="${y}"][data-z="${z}"]`
        );
        return relativeNode instanceof HTMLDivElement ? relativeNode : null;
    };

    updateDataset = () => {
        const relativeNode = this.getDomNode();
        if (relativeNode) {
            relativeNode.dataset.value = `${this.value}`;
        }
    }
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
