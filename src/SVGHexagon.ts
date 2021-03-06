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

        const text =
            this.value &&
            `<text text-anchor="middle" fill="#fff" font-size="32px">${this.value}</text>`;

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
        this.updateDataset();
        return svg;
    };

    updateDataset = () => {
        this.svg.dataset.value = `${this.value || 0}`;
        this.svg.dataset.x = `${this.cellCoordinates.x}`;
        this.svg.dataset.y = `${this.cellCoordinates.y}`;
        this.svg.dataset.z = `${this.cellCoordinates.z}`;
    };

    cleanDataset = () => {
        ['x', 'y', 'z', 'value'].forEach((atr) => {
            this.svg.removeAttribute('data-' + atr);
        });
    };

    playAnimation = () => {
        this.svg.animate(
            [
                {
                    transform: 'scale(1)',
                },
                {
                    transform: 'scale(1.5)',
                },
                {
                    transform: 'scale(1)',
                },
            ],
            {
                duration: 300,
            }
        );
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
