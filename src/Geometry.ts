export interface IGeometry {
    getVerticalDistanceToVertex: (
        angle?: number,
        insidePath?: boolean
    ) => number;
    getHorizontalDistanceToVertex: (
        angle?: number,
        insidePath?: boolean
    ) => number;
    calculateHorizontalOffsetForColumn: (column: number) => number;
    isCoordinatesApproximatelyEqual: (first: number, second: number) => boolean;
    radius: number;
}

export class Geometry implements IGeometry {
    constructor(readonly radius: number) {}

    getRadius = (insidePath?: boolean) => {
        let radius = this.radius;
        if (insidePath) {
            radius -= 20;
        }
        return radius;
    };

    getVerticalDistanceToVertex = (
        angle = 60,
        insidePath?: boolean
    ): number => {
        return this.getRadius(insidePath) * Math.sin(Geometry.toRadians(angle));
    };

    getHorizontalDistanceToVertex = (angle = 60, insidePath?: boolean) => {
        return this.getRadius(insidePath) * Math.cos(Geometry.toRadians(angle));
    };

    calculateHorizontalOffsetForColumn = (column: number) => {
        return (
            this.radius * (column + 2) +
            this.getHorizontalDistanceToVertex() * (column + 1)
        );
    };

    isCoordinatesApproximatelyEqual = (first: number, second: number) => {
        return first.toFixed(5) === second.toFixed(5);
    };

    static toRadians = (angle: number) => {
        return angle * (Math.PI / 180);
    };
}
