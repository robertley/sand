import { Cell, CellType } from "./cell.class";

export class Stone extends Cell {

    cellType = CellType.STONE;
    fallable = false;

    constructor(x: number, y: number) {
        super(x, y);
    }
}