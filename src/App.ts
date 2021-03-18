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

    initEventListener = () => {
        window.addEventListener('keypress', (event) =>
            this.game.mainEventListener(event, this.field, this.dataFetcher)
        );
    };

    start = () => {
        this.initEventListener();
        this.field.initField(this.game.goAlongXAxis);
        this.dataFetcher.getDataFromServer();
    };
}
