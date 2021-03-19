import { ISVGHexagon, IValueSVGHexagon } from './IHexagon';
import { CellCoordinates, CellData, Center, Offset } from './types';
import { BaseHexagon } from './BaseHexagon';
import { IGeometry } from './Geometry';
import webpack from 'webpack';

export class SVGHexagon extends BaseHexagon implements ISVGHexagon {
    cellCoordinates: CellCoordinates;

    svg: SVGSVGElement;

    constructor(
        geometry: IGeometry,
        cellCoordinates: CellCoordinates,
        offset: Offset,
        value?: number
    ) {
        super(geometry, value);

        this.center = {
            x: offset.xOffset,
            y: offset.yOffset,
        };
        this.cellCoordinates = cellCoordinates;
    }

    getHexagonBody = () => {
        const points: string[] = [];

        this.getHexagonPoints((point) => {
            points.push(`${point.x},${point.y}`);
        });

        const joinedPoints = points.join(' ');

        const text = this.value && `<text fill="#fff" font-size="32px">${this.value}</text>`;

        return `<polygon stroke="red" fill="${
            this.value ? '#f25f5c' : '#fff'
        }" stroke-width="5" points="${joinedPoints}" />${text}`;
    };

    draw = () => {
        const { y, x } = this.center;

        const svg = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'svg'
        );
        const { radius } = this.geometry;
        const viewBox = `${-radius} ${-radius} ${radius * 2} ${radius * 2}`;
        svg.setAttribute('viewBox', viewBox);
        svg.setAttribute('width', radius * 2 + 'px');
        svg.style.position = 'absolute';

        svg.style.transition = 'all 0.3s linear';
        svg.style.left = x + 'px';
        svg.style.top = y + 'px';

        svg.innerHTML = this.getHexagonBody();

        this.svg = svg;

        return svg;
    };

    update = () => {
        const { y, x } = this.center;
        this.svg.style.left = x + 'px';
        this.svg.style.top = y + 'px';
        this.svg.innerHTML = this.getHexagonBody();
    };
}

export class HTMLValueHexagon extends SVGHexagon implements IValueSVGHexagon {
    value: number;

    constructor(
        geometry: IGeometry,
        cellCoordinates: CellCoordinates,
        offset: Offset,
        value: number
    ) {
        super(geometry, cellCoordinates, offset, value);
    }

    toCellData = (): CellData => {
        return {
            ...this.cellCoordinates,
            value: this.value,
        };
    };
}
