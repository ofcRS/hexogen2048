import { IGeometry } from './Geometry';
import { IField } from './Field';
import { IGame } from './Game';
import { Axis, Direction, GameKey } from './types';
import { gameKeys, keyMap } from './consts';
import { IHexagon, IValueHexagon } from './Hexagon';
import { IDataFetcher } from './DataFetcher';

export class App {
    constructor(
        private readonly geometry: IGeometry,
        private readonly field: IField,
        private readonly game: IGame,
        private readonly dataFetcher: IDataFetcher
    ) {}

    nowMoving = false;

    addButton = () => {
        window.addEventListener('keypress', async ({ key }) => {
            if (this.game.isGameKeyPressed(key)) {
                if (this.nowMoving) return;
                const axisToDirection = keyMap[key];
                this.nowMoving = true;
                const result: IValueHexagon[] = [];
                this.game.goThroughAllFields(async (axisValue) => {
                    const lineHexagons = this.field.valueHexagons
                        .filter(
                            (hexagon) =>
                                hexagon.cellCoordinates[
                                    axisToDirection[Direction.NoMove]
                                    ] === axisValue
                        )
                        .sort((prev, curr) => {
                            const prevValue =
                                prev.cellCoordinates[
                                    axisToDirection[Direction.Forward]
                                    ];
                            const currentValue =
                                curr.cellCoordinates[
                                    axisToDirection[Direction.Forward]
                                    ];
                            if (prevValue < currentValue) return 1;
                            if (prevValue === currentValue) return 0;
                            return -1;
                        });

                    const axisSideCoordinates = this.game.getAxisSideCoordinates(
                        key,
                        axisValue
                    );

                    for (
                        let i = 0, limit = lineHexagons.length - 1;
                        i <= limit;
                        i++
                    ) {
                        const current = lineHexagons[i];
                        const next = lineHexagons[i + 1];
                        current.cellCoordinates = { ...axisSideCoordinates };
                        axisSideCoordinates[
                            axisToDirection[Direction.Forward]
                            ] -= 1;
                        axisSideCoordinates[
                            axisToDirection[Direction.Backward]
                            ] += 1;
                        if (!next || next.value !== current.value) {
                        } else {
                            next.cellCoordinates = {
                                ...current.cellCoordinates,
                            };
                            lineHexagons.splice(i, 1);
                            next.value *= 2;
                            limit--;
                        }
                    }
                    result.push(...lineHexagons);
                });
                this.field.valueHexagons = result;
                await Promise.all(
                    this.field.valueHexagons.map((hex) =>
                        this.field.moveHexagon(hex, hex.cellCoordinates)
                    )
                );
                this.game.data = this.field.valueHexagons.map((hexagon) =>
                    hexagon.toCellData()
                );
                await this.dataFetcher.getDataFromServer();
                this.field.updateDomElements();
                const isGameOver = this.game.isGameOver(this.field);
                if (isGameOver) {
                    alert('GG')
                }
                this.nowMoving = false;
            }
        });
    };

    start = () => {
        this.addButton();
        this.field.initField(this.game.goAlongXAxis);
        this.dataFetcher.getDataFromServer();
    };
}
