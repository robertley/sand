import { GAME } from "..";
import { AutomataLiquid } from "./automata-liquid.class";
import { Cell, CellType } from "./cell.class";
import { Empty } from "./empty.class";

export class Water extends AutomataLiquid {

    cellType = CellType.WATER;

    constructor(x: number, y: number) {
        super(x, y);
    }

    automata(): void {
        super.automata();
    }

}