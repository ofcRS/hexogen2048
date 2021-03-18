import { Geometry } from './Geometry';
import { Field, IField } from './Field';
import { Game, IGame } from './Game';
import { serverUrls } from './consts';
import { DataFetcher, IDataFetcher } from './DataFetcher';

import styles from './styles.css';

export class App {
    private _field: IField;
    private _game: IGame;
    private _dataFetcher: IDataFetcher;

    private _appWrapper: HTMLElement;
    protected _controlsWrapper: HTMLDivElement;

    private readonly CELL_SIZE = 75;

    initEventListener = () => {
        window.addEventListener('keypress', (event) =>
            this._game.mainEventListener(event, this._field, this._dataFetcher)
        );
    };

    getGameRadius = () => {
        let radius = 2;

        const { hash } = document.location;
        const hashRadius = parseInt(hash.replace('#test', ''));

        if (!Number.isNaN(hashRadius)) {
            radius = hashRadius;
        }

        return radius;
    };

    startGame = (url: string) => {
        const geometry = new Geometry(75);

        const gameRadius = this.getGameRadius();

        const canvasSize =
            geometry.getVerticalDistanceToVertex() * 2 * (gameRadius * 2 - 1);

        this._field = new Field(
            geometry,
            this._appWrapper,
            canvasSize,
            canvasSize
        );

        this._game = new Game(gameRadius);
        this._dataFetcher = new DataFetcher(this._game, this._field, url);

        this._field.initField(this._game.goAlongXAxis);
        this._dataFetcher.getDataFromServer();
        this.initEventListener();
    };

    createControlsWrapper = () => {
        const controlsWrapper = document.createElement('div');
        controlsWrapper.className = styles.controlsWrapper;
        this._appWrapper.appendChild(controlsWrapper);
        this._controlsWrapper = controlsWrapper;
    };

    createUtilityControls = () => {
        const select = document.createElement('select');
        select.addEventListener('change', ({ target }) => {
            if (target instanceof HTMLSelectElement) {
                this.startGame(target.value);
            }
        });
        select.id = 'url-server';
        serverUrls.forEach(({ value, id, title }) => {
            const option = document.createElement('option');
            option.id = id;
            option.value = value;
            option.innerText = title;

            select.appendChild(option);
        });

        this._controlsWrapper.appendChild(select);

        const gameRadiusInput = document.createElement('input');
        gameRadiusInput.value = '2';
        gameRadiusInput.type = 'number';
        this._controlsWrapper.appendChild(gameRadiusInput);

        const submitGameRadius = document.createElement('button');
        submitGameRadius.addEventListener('click', () => {
            const parsedValue = parseInt(gameRadiusInput.value);
            document.location.hash = 'test' + parsedValue;
            this.startGame(select.value);
        });
        submitGameRadius.innerHTML = 'submit';
        this._controlsWrapper.appendChild(submitGameRadius);
    };

    initApp = () => {
        this._appWrapper = document.createElement('main');
        this._appWrapper.className = styles.appWrapper;

        document.body.appendChild(this._appWrapper);

        this.createControlsWrapper();

        this.createUtilityControls();

        this.startGame(serverUrls[0].value);
    };
}
