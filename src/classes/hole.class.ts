import { Cell, CellType } from "./cell.class";

export class Hole extends Cell {
    
    cellType = CellType.HOLE;
    empty = true;

    constructor(x: number, y: number) {
        super(x, y);
    }

    automata(x: number, y: number): void {
    }
}