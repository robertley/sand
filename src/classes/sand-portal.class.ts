import { AutomataSpawner } from "./automata-spawner.class";
import { CellType } from "./cell.class";

export class SandPortal extends AutomataSpawner {

    cellType = CellType.SAND_PORTAL;
    spawnCellType = CellType.SAND;
    rate = 1000;
    direction: 'N' | 'S' | 'E' | 'W' = 'S';

    constructor(x: number, y: number) {
        super(x, y);
    }
}