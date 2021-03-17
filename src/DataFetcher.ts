import { IGame } from './Game';
import { Field, IField } from './Field';
import { CellData } from './types';

export interface IDataFetcher {
    serverUrl: string;
    getDataFromServer: () => void;
}

export class DataFetcher implements IDataFetcher {
    _serverUrl: string;

    constructor(
        private readonly _game: IGame,
        private readonly _field: IField,
        serverUrl: string
    ) {
        this.serverUrl = serverUrl;
    }

    set serverUrl(url: string) {
        this._serverUrl = url;
    }
    get serverUrl() {
        return this._serverUrl;
    }

    getDataFromServer = async () => {
        const data: CellData[] | null = await fetch(
            this.serverUrl + '/' + this._game.gameRadius,
            {
                method: 'POST',
                body: JSON.stringify(this._game.data),
            }
        ).then((res) => res.json());
        if (data) {
            data.forEach((cellData) => this._field.placeValueHexagon(cellData));
        }
    };
}
