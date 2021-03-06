import { ICanvasField } from './IField';
import { CanvasHexagon, ValueHexagon } from './CanvasHexagon';
import { IGeometry } from './Geometry';
import { CellCoordinates, CellData, HexagonType } from './types';
import { BaseField } from './BaseField';
import { ICanvasHexagon, IValueCanvasHexagon } from './IHexagon';

export class CanvasField
    extends BaseField<ICanvasHexagon, IValueCanvasHexagon>
    implements ICanvasField {
    ctx: CanvasRenderingContext2D;

    valueHexagons: IValueCanvasHexagon[] = [];

    _wrapper: HTMLDivElement;

    constructor(
        _geometry: IGeometry,
        private readonly _appWrapper: HTMLElement,
        private readonly _canvasSize: number
    ) {
        super(_geometry);

        this._createCanvas(this._canvasSize, this._canvasSize);
        this._initUtilitiesDomNodes();
    }

    private _initUtilitiesDomNodes = () => {
        this._wrapper = this._getNodeUtilityNode('wrapper');
    };

    removePreviousStuff = () => {
        const canvas = document.querySelector('canvas');

        canvas?.remove();
        this._wrapper?.remove();
    };

    clearContext = () => {
        this.ctx.clearRect(0, 0, this._canvasSize, this._canvasSize);
    };

    redraw = () => {
        this.valueHexagons.forEach((hex) => {
            return hex.draw();
        });
        this.fieldHexagons.forEach((hex) => {
            hex.draw();
        });
    };

    moveHexagon = async (
        hexagon: ICanvasHexagon,
        newCenter: CellCoordinates
    ) => {
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
        let canvas = document.querySelector('canvas');
        if (!canvas) {
            canvas = document.createElement('canvas');
        }
        const context = canvas.getContext('2d');

        if (!context) throw new Error('context not available');

        canvas.width = width;
        canvas.height = height;
        this.ctx = context;
        this.ctx.lineWidth = 1;
        this.ctx.textAlign = 'center';
        this.ctx.font = '32px sans-serif';
        this.ctx.strokeStyle = 'red';
        this.ctx.fillStyle = 'red';

        return this._appWrapper.appendChild<HTMLCanvasElement>(canvas);
    };

    private _getNodeUtilityNode = (id: string): HTMLDivElement => {
        let result = document.querySelector<HTMLDivElement>('#' + id);
        if (!result) {
            result = document.createElement('div');
            result.id = id;
            this._appWrapper.appendChild(result);
        }
        return result;
    };

    _getDomNode = (coordinates: CellCoordinates) => {
        const { y, z, x } = coordinates;
        const relativeNode = document.querySelector<HTMLDivElement>(
            `[data-x="${x}"][data-y="${y}"][data-z="${z}"]`
        );
        return relativeNode!;
    };

    _initDomNode = (coordinates: CellCoordinates) => {
        const { y, z, x } = coordinates;

        const dataNode = document.createElement('div');
        dataNode.dataset.x = `${x}`;
        dataNode.dataset.y = `${y}`;
        dataNode.dataset.z = `${z}`;
        dataNode.dataset.value = '0';
        return dataNode;
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
        this.initHexagonsLine(getData, (cellCoordinates, offset) => {
            const hexagon = new CanvasHexagon(
                {
                    y: offset.yOffset,
                    x: offset.xOffset,
                },
                this,
                this._geometry,
                cellCoordinates,
                this._wrapper
            );
            hexagon.draw();

            const domNode = this._initDomNode(cellCoordinates);
            this._wrapper.appendChild(domNode);

            this.fieldHexagons.push(hexagon);
        });
    };

    placeValueHexagon = ({ value, ...coordinates }: CellData) => {
        const relativeRecord = this.findHexagonUsingCoordinates(coordinates);
        if (relativeRecord) {
            const node = this._getDomNode(coordinates);
            node.dataset.value = `${value}`;

            const hexagon = new ValueHexagon(
                { ...relativeRecord.center },
                this,
                this._geometry,
                coordinates,
                this._wrapper,
                value
            );
            hexagon.draw();

            this.valueHexagons.push(hexagon);
        }
    };

    updateDomElements = () => {
        this.fieldHexagons.forEach((hexagon) => {
            const relativeValueHexagon = this.findHexagonUsingCoordinates<IValueCanvasHexagon>(
                hexagon.cellCoordinates,
                HexagonType.Value
            );
            const domNode = this._getDomNode(hexagon.cellCoordinates);
            if (relativeValueHexagon) {
                const domNode = this._getDomNode(hexagon.cellCoordinates);
                domNode.dataset.value = `${relativeValueHexagon.value}`;
            } else {
                domNode.dataset.value = '0';
            }
        });
    };

    updateHexagonsPosition = (
        hexagons: IValueCanvasHexagon[]
    ): Promise<unknown> => {
        this.valueHexagons = hexagons;
        return Promise.all(
            this.valueHexagons.map((hex) =>
                this.moveHexagon(hex, hex.cellCoordinates)
            )
        );
    };
}
