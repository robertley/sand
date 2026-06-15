import { Cell, CellType } from "./cell.class";

export class Empty extends Cell {
    
    cellType = CellType.EMPTY;
    empty = true;
    fallable = true;

    constructor(x: number, y: number) {
        super(x, y);
    }

    automata(): void {
    }
}