import { IGeometry } from './Geometry';
import { Hexagon, IHexagon } from './Hexagon';
import { IGame } from './Game';
import { CellCoordinates, HexagonType } from './types';

export interface IField {
    ctx: CanvasRenderingContext2D;
    initField: () => void;
    forEachFieldHexagon: (callback: (hexagon: IHexagon) => void) => void;
    clearContext: () => void;
    placeValueHexagon: (coordinates: CellCoordinates, value: number) => void;
    findHexagonUsingCoordinates: (
        coordinates: CellCoordinates,
        where?: HexagonType
    ) => null | IHexagon;
    moveHexagon: (hexagon: IHexagon, newCenter: CellCoordinates) => void;
    // drawColumn: (length: number, startCoordinates: StartCoordinates) => void;
}

export class Field implements IField {
    ctx: CanvasRenderingContext2D;
    _fieldHexagons: IHexagon[] = [];
    _valueHexagons: IHexagon[] = [];

    _canvasWidth = 4000;
    _canvasHeight = 8000;

    constructor(
        private readonly _geometry: IGeometry,
        private readonly _game: IGame
    ) {
        const context = this._createCanvas(
            this._canvasWidth,
            this._canvasHeight
        ).getContext('2d');
        if (!context) {
            throw new Error('ctx is not available');
        }
        this.ctx = context;
        this.ctx.lineWidth = 1;
        this.ctx.textAlign = 'center';
        this.ctx.font = '32px sans-serif';
        this.ctx.strokeStyle = 'red';
        this.ctx.fillStyle = 'red';
    }

    forEachFieldHexagon = (callback: (hexagon: IHexagon) => void) => {
        this._fieldHexagons.forEach((hexagon) => callback(hexagon));
    };

    findHexagonUsingCoordinates = (
        coordinates: CellCoordinates,
        type: HexagonType = HexagonType.Field
    ) => {
        const found = (type === HexagonType.Field
            ? this._fieldHexagons
            : this._valueHexagons
        ).find(
            ({ cellCoordinates: { z, y, x } }) =>
                x === coordinates.x &&
                y === coordinates.y &&
                z === coordinates.z
        );
        return found || null;
    };

    clearContext = () => {
        this.ctx.clearRect(0, 0, this._canvasWidth, this._canvasHeight);
    };

    initField = () => {
        const { gameRadius } = this._game;

        for (let i = 0; i < gameRadius; i++) {
            this.drawColumn(i + gameRadius, {
                x: i - gameRadius + 1,
                y: gameRadius - 1,
                z: -i,
            });
        }
        for (let i = 2 * gameRadius; i > gameRadius + 1; i--) {
            const x = 2 * gameRadius - i + 1;
            const y = gameRadius - x - 1;
            this.drawColumn(i - 2, {
                x,
                y,
                z: -gameRadius + 1,
            });
        }
    };

    placeValueHexagon = (coordinates: CellCoordinates, value: number) => {
        const relativeRecord = this.findHexagonUsingCoordinates(coordinates);
        if (relativeRecord) {
            const hexagon = new Hexagon(
                { ...relativeRecord.center },
                this,
                this._geometry,
                this._game,
                coordinates,
                value
            );
            hexagon.draw();
            this._valueHexagons.push(hexagon);
        }
    };

    redraw = () => {
        this._fieldHexagons.forEach((hex) => hex.draw());
        this._valueHexagons.forEach((hex) => hex.draw());
    };

    moveHexagon = async (hexagon: IHexagon, newCenter: CellCoordinates) => {
        return new Promise((resolve) => {
            const targetHexagon = this.findHexagonUsingCoordinates(newCenter);
            if (!targetHexagon) {
                return resolve(true);
            }
            const {
                center: { x: targetX, y: targetY },
            } = targetHexagon;
            const stepX = (targetX - hexagon.center.x) / 10;
            const stepY = (targetY - hexagon.center.y) / 10;

            const drawFunction = () => {
                this.clearContext();

                let nextX = hexagon.center.x;
                if (
                    !this._geometry.isCoordinatesApproximatelyEqual(
                        nextX,
                        targetX
                    )
                ) {
                    nextX += stepX;
                }

                let nextY = hexagon.center.y;
                if (
                    !this._geometry.isCoordinatesApproximatelyEqual(
                        nextY,
                        targetY
                    )
                ) {
                    nextY += stepY;
                }

                hexagon.moveTo({
                    x: nextX,
                    y: nextY,
                });
                this.redraw();

                if (
                    this._geometry.isCoordinatesApproximatelyEqual(
                        nextX,
                        targetX
                    ) &&
                    this._geometry.isCoordinatesApproximatelyEqual(
                        nextY,
                        targetY
                    )
                ) {
                    resolve(true);
                } else {
                    window.requestAnimationFrame(drawFunction);
                }
            };
            window.requestAnimationFrame(drawFunction);
            hexagon.cellCoordinates = { ...targetHexagon.cellCoordinates };
        });
    };

    private _createCanvas = (
        width: number,
        height: number
    ): HTMLCanvasElement => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        return document.body.appendChild<HTMLCanvasElement>(canvas);
    };

    private drawColumn(
        length: number,
        startCoordinates: CellCoordinates
    ): void {
        const {
            getDistanceToVerticalVertex,
            calculateHorizontalOffsetForColumn,
        } = this._geometry;

        for (let i = 1; i <= length; i++) {
            const cellY = startCoordinates.y - i + 1;
            const cellZ = startCoordinates.z + i - 1;

            const columnIndex = startCoordinates.x + this._game.gameRadius - 1;
            const xOffset = calculateHorizontalOffsetForColumn(columnIndex - 1);

            let yOffsetMultiplier =
                this._game.gameRadius - columnIndex - 2 + i * 2;

            if (columnIndex >= this._game.gameRadius) {
                yOffsetMultiplier = columnIndex - this._game.gameRadius + i * 2;
            }

            const yOffset = yOffsetMultiplier * getDistanceToVerticalVertex();

            // window.requestAnimationFrame(() => {
            const hexagon = new Hexagon(
                {
                    y: yOffset,
                    x: xOffset,
                },
                this,
                this._geometry,
                this._game,
                {
                    x: startCoordinates.x,
                    z: cellZ,
                    y: cellY,
                }
            );
            hexagon.draw();
            this._fieldHexagons.push(hexagon);

            // const relativeRecord = this._game.data.find(
            //     ({ x, y, z }) =>
            //         startCoordinates.x === x &&
            //         cellY === y &&
            //         cellZ === z
            // );
            // if (relativeRecord) {
            //     hexagon.moveTo(Axis.X, 1)
            // }
        }
    }
}
