import { IGeometry } from './Geometry';
import { Hexagon, IHexagon, IValueHexagon, ValueHexagon } from './Hexagon';
import { IGame } from './Game';
import {
    CellCoordinates,
    CellData,
    Direction,
    HexagonType,
    MapAxisToDirection,
} from './types';

export interface IField {
    ctx: CanvasRenderingContext2D;
    initField: (
        getData: (
            callback: (
                columnLength: number,
                cellCoordinates: CellCoordinates,
                index: number
            ) => void
        ) => void
    ) => void;
    forEachFieldHexagon: (callback: (hexagon: IHexagon) => void) => void;
    clearContext: () => void;
    placeValueHexagon: (coordinates: CellData) => void;
    findHexagonUsingCoordinates: <T extends IHexagon>(
        coordinates: CellCoordinates,
        where?: HexagonType
    ) => null | T;
    moveHexagon: (hexagon: IHexagon, newCenter: CellCoordinates) => void;
    fieldHexagons: IHexagon[];
    valueHexagons: IValueHexagon[];
    removeHexagon: (hexagon: IValueHexagon) => void;
    redraw: () => void;
    updateDomElements: () => void;
    getHexagonsSortedAlongAxis: (
        axisValue: number,
        axisToDirection: MapAxisToDirection
    ) => IValueHexagon[];
    updateHexagonsPosition: () => Promise<unknown[]>;
}

export class Field implements IField {
    ctx: CanvasRenderingContext2D;

    _fieldHexagons: IHexagon[] = [];

    get fieldHexagons() {
        return this._fieldHexagons;
    }

    valueHexagons: IValueHexagon[] = [];

    _canvasWidth = 800;
    _canvasHeight = 600;

    _wrapper: HTMLDivElement | null = null;

    constructor(private readonly _geometry: IGeometry) {
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

    findHexagonUsingCoordinates = <T extends IHexagon>(
        coordinates: CellCoordinates,
        type: HexagonType = HexagonType.Field
    ): T | null => {
        const found = (type === HexagonType.Field
            ? this._fieldHexagons
            : this.valueHexagons
        ).find(
            ({ cellCoordinates: { z, y, x } }) =>
                x === coordinates.x &&
                y === coordinates.y &&
                z === coordinates.z
        );
        return (found as T) || null;
    };

    clearContext = () => {
        this.ctx.clearRect(0, 0, this._canvasWidth, this._canvasHeight);
    };

    placeValueHexagon = ({ value, ...coordinates }: CellData) => {
        const relativeRecord = this.findHexagonUsingCoordinates(coordinates);
        if (relativeRecord) {
            const hexagon = new ValueHexagon(
                { ...relativeRecord.center },
                this,
                this._geometry,
                coordinates,
                value
            );
            hexagon.draw();
            this.valueHexagons.push(hexagon);
        }
    };

    updateDomElements = () => {
        this.valueHexagons.forEach((hex) => {
            hex.updateDataset();
        });
    };

    redraw = () => {
        this.valueHexagons.forEach((hex) => {
            return hex.draw();
        });
        this._fieldHexagons.forEach((hex) => {
            hex.draw();
        });
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
            const stepX = (targetX - hexagon.center.x) / 15;
            const stepY = (targetY - hexagon.center.y) / 15;

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
        });
    };

    private _createCanvas = (
        width: number,
        height: number
    ): HTMLCanvasElement => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const wrapper = document.createElement('div');
        wrapper.className = 'wrapper';
        document.body.appendChild(wrapper);
        this._wrapper = wrapper;

        return document.body.appendChild<HTMLCanvasElement>(canvas);
    };

    initField = (
        getData: (
            callback: (
                columnLength: number,
                cellCoordinates: CellCoordinates,
                index: number
            ) => void
        ) => void
    ) => {
        getData((length, startCoordinates, index) => {
            const {
                getVerticalDistanceToVertex,
                calculateHorizontalOffsetForColumn,
            } = this._geometry;

            for (let i = 1; i <= length; i++) {
                const cellY = startCoordinates.y - i + 1;
                const cellZ = startCoordinates.z + i - 1;

                const xOffset = calculateHorizontalOffsetForColumn(index - 1);

                const yOffsetMultiplier =
                    Math.abs(startCoordinates.x) - 1 + i * 2;

                const yOffset =
                    yOffsetMultiplier * getVerticalDistanceToVertex();

                const hexagon = new Hexagon(
                    {
                        y: yOffset,
                        x: xOffset,
                    },
                    this,
                    this._geometry,
                    {
                        x: startCoordinates.x,
                        z: cellZ,
                        y: cellY,
                    }
                );
                hexagon.draw();
                if (this._wrapper) {
                    hexagon.initDomNode(this._wrapper);
                }
                this._fieldHexagons.push(hexagon);
            }
        });
    };

    removeHexagon = (hexagon: IValueHexagon) => {
        this.valueHexagons = this.valueHexagons.filter(
            (hex) => hex !== hexagon
        );
    };

    getHexagonsSortedAlongAxis = (
        axisValue: number,
        axisToDirection: MapAxisToDirection
    ): IValueHexagon[] => {
        return this.valueHexagons
            .filter(
                (hexagon) =>
                    hexagon.cellCoordinates[
                        axisToDirection[Direction.NoMove]
                    ] === axisValue
            )
            .sort((prev, curr) => {
                const prevValue =
                    prev.cellCoordinates[axisToDirection[Direction.Forward]];
                const currentValue =
                    curr.cellCoordinates[axisToDirection[Direction.Forward]];
                if (prevValue < currentValue) return 1;
                if (prevValue === currentValue) return 0;
                return -1;
            });
    };

    updateHexagonsPosition = (): Promise<unknown[]> => {
        return Promise.all(
            this.valueHexagons.map((hex) =>
                this.moveHexagon(hex, hex.cellCoordinates)
            )
        );
    };
}
