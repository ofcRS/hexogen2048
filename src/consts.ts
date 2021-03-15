import { Axis, Direction, GameKey, MapAxisToDirection } from './types';

export const gameKeys: string[] = [
    GameKey.Q,
    GameKey.D,
    GameKey.W,
    GameKey.S,
    GameKey.E,
    GameKey.A,
];

export const keyMap: Record<GameKey, MapAxisToDirection> = {
    [GameKey.W]: {
        [Direction.NoMove]: Axis.X,
        [Direction.Forward]: Axis.Y,
        [Direction.Backward]: Axis.Z,
    },
    [GameKey.S]: {
        [Direction.NoMove]: Axis.X,
        [Direction.Backward]: Axis.Y,
        [Direction.Forward]: Axis.Z,
    },
    [GameKey.Q]: {
        [Direction.Backward]: Axis.X,
        [Direction.Forward]: Axis.Y,
        [Direction.NoMove]: Axis.Z,
    },
    [GameKey.D]: {
        [Direction.Forward]: Axis.X,
        [Direction.Backward]: Axis.Y,
        [Direction.NoMove]: Axis.Z,
    },
    [GameKey.E]: {
        [Direction.Forward]: Axis.X,
        [Direction.NoMove]: Axis.Y,
        [Direction.Backward]: Axis.Z,
    },
    [GameKey.A]: {
        [Direction.Backward]: Axis.X,
        [Direction.NoMove]: Axis.Y,
        [Direction.Forward]: Axis.Z,
    },
};
