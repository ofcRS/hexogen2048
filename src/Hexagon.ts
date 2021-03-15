import { IField } from './Field';
import { IGeometry } from './Geometry';
import { IGame } from './Game';
import { CellCoordinates } from './types';

type Center = { x: number; y: number };

export interface IHexagon {
    draw: () => void;
    moveTo: (coordinates: Center) => void;
    cellCoordinates: CellCoordinates;
    center: Center;
    value?: number;
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

    moveTo = ({ y, x }: Center): void => {
        this.center.x = x;
        this.center.y = y;
    };

    draw = () => {
        const x = this.center.x;
        const y = this.center.y;

        const {
            getDistanceToVerticalVertex,
            getDistanceToHorizontalVertex,
        } = this._geometry;

        const { ctx } = this._field;

        // const relativeRecord = this._game.data.find(
        //     ({ x, y, z }) =>
        //         cellCoordinates.x === x &&
        //         cellCoordinates.y === y &&
        //         cellCoordinates.z === z
        // );

        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const xPoint = x + getDistanceToHorizontalVertex(i * 60);
            const yPoint = y + getDistanceToVerticalVertex(i * 60);

            ctx.lineTo(xPoint, yPoint);
        }

        ctx.fillText(`${this.value || ''}`, x, y);

        ctx.closePath();
        ctx.stroke();

        // if (this.direction) {
        //     this.prevValue += this._step;
        // } else {
        //     this.prevValue -= this._step;
        // }
        //
        // if (this.prevValue > 1000 || this.prevValue < 0) {
        //     this.direction = !this.direction;
        // }

        // setTimeout(() => {
        //     this._field.ctx.clearRect(0, 0, 8000, 8000);
        //     return window.requestAnimationFrame(this.draw);
        // });
    };
}
