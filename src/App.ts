import { IGeometry } from './Geometry';
import { IField } from './Field';
import { IGame } from './Game';

export class App {
    data = [
        { x: 0, y: 1, z: -1, value: 4 },
        { x: -1, y: 1, z: 0, value: 2 },
        { x: -1, y: 0, z: 1, value: 2 },
    ];

    constructor(
        private readonly geometry: IGeometry,
        private readonly field: IField,
        private readonly game: IGame
    ) {}

    start = () => {
        const { gameRadius } = this.game;

        for (let i = 0; i < gameRadius; i++) {
            this.field.drawColumn(i + gameRadius, i);
        }
        for (let i = 2 * gameRadius; i > gameRadius + 1; i--) {
            console.log(i -gameRadius)
            this.field.drawColumn(i -gameRadius , 2 * gameRadius - i + gameRadius);
        }
    };
}
