import { Geometry } from './Geometry';
import { Game, IGame } from './Game';
import { graphicTypes, serverUrls } from './consts';
import { DataFetcher, IDataFetcher } from './DataFetcher';

import styles from './styles.css';
import { GameStatus, GraphicType } from './types';
import { CanvasField } from './CanvasField';
import { SVGField } from './SVGField';
import { IBaseField } from './IField';
import { IBaseHexagon, IBaseValueHexagon } from './IHexagon';

export class App {
    private _field: IBaseField;
    private _game: IGame;
    private _dataFetcher: IDataFetcher;

    private _appWrapper: HTMLElement;
    private _controlsWrapper: HTMLDivElement;

    private _gameStatusNode: HTMLDivElement;

    private readonly CELL_SIZE = 75;

    initEventListener = () => {
        window.addEventListener('keypress', (event) => {
            this._game.mainEventListener(event, this._field, this._dataFetcher);
        });
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

    startGame = (url: string, graphicType: GraphicType) => {
        const geometry = new Geometry(this.CELL_SIZE);

        const gameRadius = this.getGameRadius();

        this._updateGameStatusNode(GameStatus.PLAYING);

        const canvasSize =
            geometry.getVerticalDistanceToVertex() * 2 * (gameRadius * 2 - 1);

        this._field?.removePreviousStuff();

        this._field =
            graphicType === GraphicType.CANVAS
                ? new CanvasField(geometry, this._appWrapper, canvasSize)
                : (new SVGField(geometry, this._appWrapper) as any);

        this._game = new Game(gameRadius, () =>
            this._updateGameStatusNode(GameStatus.OVER)
        );
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

    _updateGameStatusNode = (status: GameStatus) => {
        this._gameStatusNode.innerText = status;
        this._gameStatusNode.dataset.status = status;
    };

    createUtilityControls = () => {
        const gameStatus = document.createElement('div');

        gameStatus.className = styles.gameStatus;
        this._controlsWrapper.appendChild(gameStatus);
        this._gameStatusNode = gameStatus;
        this._updateGameStatusNode(GameStatus.PLAYING);

        const graphicTypesSelect = document.createElement('select');
        const serverSelect = document.createElement('select');

        graphicTypes.forEach(({ title, type }) => {
            const option = document.createElement('option');
            option.value = type;
            option.innerText = title;

            graphicTypesSelect.appendChild(option);
        });
        serverUrls.forEach(({ value, id, title }) => {
            const option = document.createElement('option');
            option.id = id;
            option.value = value;
            option.innerText = title;

            serverSelect.appendChild(option);
        });

        serverSelect.addEventListener('change', ({ target }) => {
            if (target instanceof HTMLSelectElement) {
                this.startGame(
                    target.value,
                    graphicTypesSelect.value as GraphicType
                );
            }
        });
        graphicTypesSelect.addEventListener('change', ({ target }) => {
            if (target instanceof HTMLSelectElement) {
                this.startGame(serverSelect.value, target.value as GraphicType);
            }
        });
        serverSelect.id = 'url-server';

        this._controlsWrapper.appendChild(serverSelect);

        this._controlsWrapper.appendChild(graphicTypesSelect);

        const gameRadiusInput = document.createElement('input');
        gameRadiusInput.value = '2';
        gameRadiusInput.type = 'number';
        this._controlsWrapper.appendChild(gameRadiusInput);

        const submitGameRadius = document.createElement('button');
        submitGameRadius.addEventListener('click', () => {
            const parsedValue = parseInt(gameRadiusInput.value);
            document.location.hash = 'test' + parsedValue;
            this.startGame(
                serverSelect.value,
                graphicTypesSelect.value as GraphicType
            );
        });
        submitGameRadius.innerHTML = 'Submit';
        this._controlsWrapper.appendChild(submitGameRadius);
    };

    initApp = () => {
        this._appWrapper = document.createElement('main');
        this._appWrapper.className = styles.appWrapper;

        document.body.appendChild(this._appWrapper);

        this.createControlsWrapper();

        this.createUtilityControls();

        this.startGame(serverUrls[0].value, graphicTypes[0].type);
    };
}
