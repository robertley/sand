import { Cell } from "./cell.class";

export abstract class AutomataCell extends Cell {
    
    constructor(x: number, y: number) {
        super(x, y);
    }

    abstract automata(): void;
}