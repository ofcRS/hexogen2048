import { IField } from './Field';
import { Geometry, IGeometry } from './Geometry';

type Center = { x: number; y: number };

export interface IHexagon {
    draw: () => void;
}

export class Hexagon implements IHexagon {
    private prevValue = 0;
    private direction = true;
    private readonly _step = 20;

    constructor(
        private readonly _center: Center,
        private readonly _field: IField,
        private readonly _geometry: IGeometry
    ) {}

    draw = () => {
        const x = this._center.x + this.prevValue;
        const y = this._center.y + this.prevValue;

        const {
            getDistanceToVerticalVertex,
            getDistanceToHorizontalVertex,
        } = this._geometry;

        const { ctx } = this._field;

        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const xPoint = x + getDistanceToHorizontalVertex(i * 60);
            const yPoint = y + getDistanceToVerticalVertex(i * 60);

            ctx.lineTo(xPoint, yPoint);
        }

        ctx.closePath();
        ctx.stroke();

        if (this.direction) {
            this.prevValue += this._step;
        } else {
            this.prevValue -= this._step;
        }

        if (this.prevValue > 1000 || this.prevValue < 0) {
            this.direction = !this.direction;
        }

        // setTimeout(() => {
        //     this._field.ctx.clearRect(0, 0, 8000, 8000);
        //     return window.requestAnimationFrame(this.draw);
        // });
    };
}
