export interface IGeometry {
    getDistanceToVerticalVertex: (angle?: number) => number;
    getDistanceToHorizontalVertex: (angle?: number) => number;
    calculateHorizontalOffsetForColumn: (column: number) => number;
    radius: number;
}

export class Geometry implements IGeometry {
    constructor(readonly radius: number) {}

    getDistanceToVerticalVertex = (angle = 60) => {
        return this.radius * Math.sin(Geometry.toRadians(angle));
    };

    getDistanceToHorizontalVertex = (angle = 60) => {
        return this.radius * Math.cos(Geometry.toRadians(angle));
    };

    calculateHorizontalOffsetForColumn = (column) => {
        return (
            this.radius * (column + 2) +
            this.getDistanceToHorizontalVertex() * (column + 1)
        );
    };

    static toRadians = (angle: number) => {
        return angle * (Math.PI / 180);
    };
}
