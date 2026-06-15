import { AutomataCell } from "./automata-cell.class";
import { Cell } from "./cell.class";

export abstract class AutomataGas extends AutomataCell {

    abstract maxPhase: number | null;
    phase: number = 0;

    constructor(x: number, y: number) {
        super(x, y);
    }

    automata(): void {

        if (this.maxPhase != null) {

            if (this.phase >= this.maxPhase) {
                this.destroy();
                return;
            }

        
            if (this.phase < this.maxPhase!) {
                this.phase++;
            }
        }

        let moveCells: Cell[] = [];

        // priortize upwards movement for gases
        if (this.N != null && this.N.fallable) {
            moveCells.push(this.N);
        }
        if (this.NE != null && this.NE.fallable) {
            moveCells.push(this.NE);
        }
        if (this.NW != null && this.NW.fallable) {
            moveCells.push(this.NW);
        }

        if (moveCells.length > 0) {
            let moveCell = moveCells[Math.floor(Math.random() * moveCells.length)];
            this.move(moveCell);
            return;
        }

        let horizontalMoveCells: Cell[] = [];

        if (this.E != null && this.E.fallable) {
            horizontalMoveCells.push(this.E);
        }
        if (this.W != null && this.W.fallable) {
            horizontalMoveCells.push(this.W);
        }

        if (horizontalMoveCells.length > 0) {
            let moveCell = horizontalMoveCells[Math.floor(Math.random() * horizontalMoveCells.length)];
            this.move(moveCell);
            return;
        }
    }
}