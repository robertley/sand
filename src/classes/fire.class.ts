import { AutomataGas } from "./automata-gas.class";
import { CellType } from "./cell.class";

export class Fire extends AutomataGas {

    cellType: CellType = CellType.FIRE;

    maxPhase: number = 4;

    constructor(x: number, y: number) {
        super(x, y);
    }

    automata() {
        super.automata();
    }
}