import { Cell, CellType, Dirt, Empty, Sand } from "../classes";
import { Fire } from "../classes/fire.class";
import { Hole } from "../classes/hole.class";
import { SandPortal } from "../classes/sand-portal.class";
import { Stone } from "../classes/stone.class";
import { WaterPortal } from "../classes/water-portal.class";
import { Water } from "../classes/water.class";

export function getAbstractCell(cellType: CellType, x: number, y: number): Cell {
    switch (cellType) {
        case CellType.EMPTY:
            return new Empty(x, y);
        case CellType.SAND:
            return new Sand(x, y);
        case CellType.DIRT:
            return new Dirt(x, y);
        case CellType.WATER:
            return new Water(x, y);
        case CellType.HOLE:
            return new Hole(x, y);
        case CellType.STONE:
            return new Stone(x, y);
        case CellType.FIRE:
            return new Fire(x, y);
        case CellType.SAND_PORTAL:
            return new SandPortal(x, y);
        case CellType.WATER_PORTAL:
            return new WaterPortal(x, y);
        default:
            console.error(`Error: no class found for cell type ${cellType}`);
            return new Empty(x, y);
    }
}