import { IGeometry } from './Geometry';
import { Hexagon, IHexagon } from './Hexagon';
import { IGame } from './Game';

export interface IField {
    ctx: CanvasRenderingContext2D;
    drawColumn: (length: number, columnIndex: number) => void;
}

export class Field implements IField {
    ctx: CanvasRenderingContext2D;

    constructor(
        private readonly _geometry: IGeometry,
        private readonly _game: IGame
    ) {
        this.ctx = this._createCanvas(4000, 8000).getContext('2d');
        this.ctx.lineWidth = 4;
        this.ctx.textAlign = 'center';
        this.ctx.font = '58px serif';
        this.ctx.strokeStyle = 'red';
        this.ctx.fillStyle = 'red';
    }

    private _createCanvas = (
        width: number,
        height: number
    ): HTMLCanvasElement => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        return document.body.appendChild<HTMLCanvasElement>(canvas);
    };

    drawColumn = (length: number, columnIndex: number) => {
        const {
            getDistanceToVerticalVertex,
            calculateHorizontalOffsetForColumn,
        } = this._geometry;

        for (let i = 1; i <= length; i++) {
            const xOffset = calculateHorizontalOffsetForColumn(columnIndex - 1);

            let yOffsetMultiplier =
                this._game.gameRadius - columnIndex - 2 + i * 2;

            if (columnIndex >= this._game.gameRadius) {
                yOffsetMultiplier = 2 + i * 2;
            }

            const yOffset = yOffsetMultiplier * getDistanceToVerticalVertex();

            window.requestAnimationFrame(
                new Hexagon(
                    {
                        y: yOffset,
                        x: xOffset,
                    },
                    this,
                    this._geometry
                ).draw
            );
        }
    };
}
