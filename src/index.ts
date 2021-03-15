import { Geometry } from './Geometry';
import { App } from './App';
import { Field } from './Field';
import { Game } from './Game';

const game = new Game(3);
const geometry = new Geometry(75);
const field = new Field(geometry, game);

const app = new App(geometry, field, game);
app.start();
