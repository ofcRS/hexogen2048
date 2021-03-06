import { BaseField } from './BaseField';
import { ISVGField } from './IField';
import { CellCoordinates, CellData, GetData, HexagonType } from './types';
import { IGeometry } from './Geometry';
import { HTMLValueHexagon, SVGHexagon } from './SVGHexagon';

import styles from './styles.css';
import { ISVGHexagon, IValueSVGHexagon } from './IHexagon';

export class SVGField
    extends BaseField<ISVGHexagon, IValueSVGHexagon>
    implements ISVGField {
    private _hexagonsWrapper: HTMLDivElement;

    constructor(
        geometry: IGeometry,
        private readonly _appWrapper: HTMLElement
    ) {
        super(geometry);
        this._createHexagonsWrapper();
    }

    removePreviousStuff = () => {
        this._hexagonsWrapper?.remove();
    };

    _createHexagonsWrapper = () => {
        const hexagonsWrapper = document.createElement('div');
        hexagonsWrapper.className = styles.hexagonsWrapper;

        this._appWrapper.appendChild(hexagonsWrapper);

        this._hexagonsWrapper = hexagonsWrapper;
    };

    initField = (getData: GetData) => {
        this.initHexagonsLine(getData, (cellCoordinates, offset) => {
            const hexagon = new SVGHexagon(
                this._geometry,
                cellCoordinates,
                offset
            );
            this._hexagonsWrapper.appendChild(hexagon.draw());
            this.fieldHexagons.push(hexagon);
        });
    };

    placeValueHexagon = ({ value, ...coordinates }: CellData) => {
        const relativeFieldHexagon = this.findHexagonUsingCoordinates<ISVGHexagon>(
            coordinates
        );

        if (relativeFieldHexagon) {
            relativeFieldHexagon.cleanDataset();
            const hexagon = new HTMLValueHexagon(
                this._geometry,
                coordinates,
                {
                    xOffset: relativeFieldHexagon.center.x,
                    yOffset: relativeFieldHexagon.center.y,
                },
                value
            );
            this.valueHexagons.push(hexagon);
            this._hexagonsWrapper.appendChild(hexagon.draw());
            hexagon.playAnimation();
        }
    };

    moveHexagon = (hexagon: ISVGHexagon, newCenter: CellCoordinates) => {
        const relativeFieldHexagon = this.findHexagonUsingCoordinates<ISVGHexagon>(
            newCenter
        );
        if (relativeFieldHexagon) {
            hexagon.center = { ...relativeFieldHexagon.center };
            hexagon.update();
        }
    };

    updateHexagonsPosition = async (updatedList: IValueSVGHexagon[]) => {
        updatedList.forEach((hex) =>
            this.moveHexagon(hex, { ...hex.cellCoordinates })
        );
        this.valueHexagons.forEach((hex) => {
            if (!updatedList.includes(hex)) {
                hex.svg?.remove();
            }
        });
        this.valueHexagons = updatedList;
    };

    updateDomElements = () => {
        this.fieldHexagons.forEach((hexagon) => {
            const relativeValueHexagon = this.findHexagonUsingCoordinates<IValueSVGHexagon>(
                hexagon.cellCoordinates,
                HexagonType.Value
            );
            if (relativeValueHexagon) {
                hexagon.cleanDataset();
                relativeValueHexagon.updateDataset();
            } else {
                hexagon.updateDataset();
            }
        });
    };
}
