import { AutomataSpawner } from "./automata-spawner.class";
import { CellType } from "./cell.class";

export class WaterPortal extends AutomataSpawner {
    cellType = CellType.WATER_PORTAL;
    spawnCellType = CellType.WATER;
    rate = 1000;
    direction: 'N' | 'S' | 'E' | 'W' = 'S';

    constructor(x: number, y: number) {
        super(x, y);
    }
}