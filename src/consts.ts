import {
    Axis,
    Direction,
    GameKey,
    GraphicType,
    MapAxisToDirection,
} from './types';

export const graphicTypes = [
    {
        title: 'SVG Elements',
        type: GraphicType.SVGELEMENTS,
    },
    {
        title: 'Canvas',
        type: GraphicType.CANVAS,
    },
] as const;

export const serverUrls = [
    {
        id: 'localhost',
        value: 'http://localhost:13337',
        title: 'Local server',
    },
    {
        id: 'remote',
        value: '//68f02c80-3bed-4e10-a747-4ff774ae905a.pub.instances.scw.cloud',
        title: 'Remote server',
    },
] as const;

export const gameKeys: GameKey[] = [
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
