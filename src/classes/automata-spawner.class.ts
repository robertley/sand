import { GAME } from "..";
import { getAbstractCell } from "../scripts/helper";
import { AutomataCell } from "./automata-cell.class";
import { CellType } from "./cell.class";

export abstract class AutomataSpawner extends AutomataCell {

    abstract spawnCellType: CellType;
    abstract rate: number;
    abstract direction: 'N' | 'S' | 'E' | 'W';

    lastSpawnTime: number = Date.now();

    constructor(x: number, y: number) {
        super(x, y);
    }

    automata(): void {
        let now = Date.now();
        if (now - this.lastSpawnTime < this.rate) {
            return;
        }

        let y = this.y;
        let x = this.x;
        if (this.direction === 'N') {
            y = this.y - 1;
        } else if (this.direction === 'S') {
            y = this.y + 1;
        } else if (this.direction === 'E') {
            x = this.x + 1;
        } else if (this.direction === 'W') {
            x = this.x - 1;
        }
        let spawnCell = getAbstractCell(this.spawnCellType, x, y);
        if (spawnCell != null && Math.random() < this.rate) {
            GAME.grid[y][x] = spawnCell;
        }

        this.lastSpawnTime = now;
    }
}