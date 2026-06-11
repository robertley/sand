import { Cell, CellType } from "./cell.class";

export class Empty extends Cell {
    
    cellType = CellType.EMPTY;
    empty = true;

    constructor(x: number, y: number) {
        super(x, y);
    }

    automata(x: number, y: number): void {
    }
}