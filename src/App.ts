import { IGeometry } from './Geometry';
import { IField } from './Field';
import { IGame } from './Game';
import { Axis, Direction, GameKey } from './types';
import { gameKeys } from './consts';
import { IHexagon } from "./Hexagon";

export class App {
    constructor(
        private readonly geometry: IGeometry,
        private readonly _field: IField,
        private readonly game: IGame
    ) {}

    gameCells = [
        { x: 0, y: 1, z: -1, value: 4 },
        { x: -1, y: 1, z: 0, value: 2 },
        { x: -1, y: 0, z: 1, value: 2 },
    ];

    nowMoving = false;

    addButton = () => {
        window.addEventListener('keypress', async ({ key }) => {
            if (!gameKeys.includes(key)) return;
            if (this.nowMoving) return;

            this.nowMoving = true;
            await Promise.all(
                this._field._valueHexagons.map(async (hexagon: IHexagon) => {
                    const newCenter  = this.game.moveAlongAxis(key as GameKey, hexagon.cellCoordinates);

                    return this._field.moveHexagon(hexagon, newCenter);
                })
            );
            this.nowMoving = false;
        });
    };

    start = () => {
        this.addButton();
        this._field.initField();
        this.gameCells.forEach((gameCell) => {
            this._field.placeValueHexagon(gameCell, gameCell.value);
        });
    };
}
