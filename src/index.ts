import { Geometry } from './Geometry';
import { App } from './App';
import { Field } from './Field';
import { Game } from './Game';
import { DataFetcher } from './DataFetcher';

const geometry = new Geometry(75);
const game = new Game(3);
const field = new Field(geometry, game);
const dataFetcher = new DataFetcher(game, field, "http://localhost:13337");

const app = new App(geometry, field, game, dataFetcher);
app.start();
