import { CellType } from "./cell.class";
import { AutomataSolid } from "./automata-solid.class";

export class Dirt extends AutomataSolid {

    cellType = CellType.DIRT;

    constructor(x: number, y: number) {
        super(x, y);
    }
}