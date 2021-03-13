export interface IGame {
    gameRadius: number;
}

export class Game implements IGame {
    constructor(readonly gameRadius: number) {}
}
