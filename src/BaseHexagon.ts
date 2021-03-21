import { IBaseHexagon } from './IHexagon';
import { Axis, CellCoordinates, Center } from './types';
import { IGeometry } from './Geometry';

export class BaseHexagon implements IBaseHexagon {
    center: Center;
    cellCoordinates: CellCoordinates;

    constructor(public readonly geometry: IGeometry, public value?: number) {}

    isEqualCoordinates = (coordinates: CellCoordinates) => {
        return (Object.keys(coordinates) as Axis[]).every(
            (key) => coordinates[key] === this.cellCoordinates[key]
        );
    };

    getHexagonPoints = (
        callback: (point: { x: number; y: number }) => void,
        insidePath?: boolean
    ) => {
        const {
            getHorizontalDistanceToVertex,
            getVerticalDistanceToVertex,
        } = this.geometry;

        for (let i = 0; i < 6; i++) {
            const x = getHorizontalDistanceToVertex(i * 60, insidePath);
            const y = getVerticalDistanceToVertex(i * 60, insidePath);

            callback({
                y,
                x,
            });
        }
    };
}
