import { GAME } from "..";

const FALL_CELLS = ['empty', 'hole'];
const WATER_CELLS = ['water', 'water-left', 'water-right'];
const STEAM_ENGINE_CELLS = ['steam-engine-0', 'steam-engine-1', 'steam-engine-2', 'steam-engine-3', 'steam-engine-4'];
const DRY_DIRT_CELLS = ['dirt', 'dirt-with-seed'];
const WET_DIRT_CELLS = ['wet-dirt', 'wet-dirt-with-seed'];
const WATER_VAPOR_CELLS = ['water-vapor-0', 'water-vapor-1', 'water-vapor-2', 'water-vapor-3', 'water-vapor-4'];
const DIRT_CELLS = [...DRY_DIRT_CELLS, ...WET_DIRT_CELLS];
const PORTAL_SPAWN_MAP = new Map<string, number>();

export enum CellType {
    EMPTY,
    SAND,
    WATER,
    HOLE,
    DIRT,
    STONE,
    WATER_VAPOR,
    STEAM_ENGINE,
    SAND_PORTAL,
    WATER_PORTAL,
    WIRE,
    SEED,
    FISH,
    FIRE,
    TORCH
}

export const CELL_TYPES = new Set<CellType>(
    [
        CellType.EMPTY,
        CellType.SAND,
        CellType.WATER,
        CellType.HOLE,
        CellType.DIRT,
        CellType.STONE,
        CellType.WATER_VAPOR,
        CellType.STEAM_ENGINE,
        CellType.SAND_PORTAL,
        CellType.WATER_PORTAL,
        CellType.WIRE,
        CellType.SEED,
        CellType.FISH,
        CellType.TORCH,
        CellType.FIRE
    ]
)

export abstract class Cell {

    abstract cellType: CellType;
    
    x: number;
    y: number;
    fallable: boolean = false;
    sinkable: boolean = false;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    sit() {
        // GAME.grid[this.y][this.x] = this;
    }

    fall() {
        const southCell = this.S;

        if (southCell != null) {
            this.move(southCell);
        }
    }

    tryFallInHole(cell: Cell | null): boolean {
        if (cell && cell.cellType === CellType.HOLE) {
            // GAME.grid[this.y][this.x] = new Empty(this.x, this.y);
            return true;
        }
        return false;
    }

    move(destinationCell: Cell) {
        if (this.tryFallInHole(destinationCell)) {
            GAME.removeCell(this.x, this.y);
            return;
        }

        let x = this.x;
        let y = this.y;
        let dx = destinationCell.x;
        let dy = destinationCell.y;
        destinationCell.x = x;
        destinationCell.y = y;

        this.x = dx;
        this.y = dy;
        GAME.grid[dy][dx] = this;
        GAME.grid[y][x] = destinationCell;
    }

    destroy() {
        GAME.removeCell(this.x, this.y);
    }

    get canFall(): boolean {
        return this.S == null ? false : this.S.fallable;
    }

    get canSink(): boolean {
        return this.S_sinkable || this.SW_sinkable || this.SE_sinkable;
    }

    get W(): Cell | null {
        return this.x - 1 >= 0 ? GAME.grid[this.y][this.x - 1] : null;
    }

    get N(): Cell | null {
        return this.y - 1 >= 0 ? GAME.grid[this.y - 1][this.x] : null;
    }

    get E(): Cell | null {
        return this.x + 1 < GAME.width ? GAME.grid[this.y][this.x + 1] : null;
    }

    get S(): Cell | null {
        return this.y + 1 < GAME.height ? GAME.grid[this.y + 1][this.x] : null;
    }

    get NW(): Cell | null {
        return this.x - 1 >= 0 && this.y - 1 >= 0 ? GAME.grid[this.y - 1][this.x - 1] : null;
    }

    get NE(): Cell | null {
        return this.x + 1 < GAME.width && this.y - 1 >= 0 ? GAME.grid[this.y - 1][this.x + 1] : null;
    }

    get SW(): Cell | null {
        return this.x - 1 >= 0 && this.y + 1 < GAME.height ? GAME.grid[this.y + 1][this.x - 1] : null;
    }

    get SE(): Cell | null {
        return this.x + 1 < GAME.width && this.y + 1 < GAME.height ? GAME.grid[this.y + 1][this.x + 1] : null;
    }

    get SW_fallable(): boolean {
        return this.SW == null ? false : this.SW.fallable;
    }

    get SE_fallable(): boolean {
        return this.SE == null ? false : this.SE.fallable;
    }

    get W_fallable(): boolean {
        return this.W == null ? false : this.W.fallable;
    }

    get E_fallable(): boolean {
        return this.E == null ? false : this.E.fallable;
    }

    get NW_fallable(): boolean {
        return this.NW == null ? false : this.NW.fallable;
    }

    get NE_fallable(): boolean {
        return this.NE == null ? false : this.NE.fallable;
    }

    get N_fallable(): boolean {
        return this.N == null ? false : this.N.fallable;
    }

    get S_sinkable(): boolean {
        return this.S == null ? false : this.S.sinkable;
    }

    get SW_sinkable(): boolean {
        return this.SW == null ? false : this.SW.sinkable;
    }

    get SE_sinkable(): boolean {
        return this.SE == null ? false : this.SE.sinkable;
    }
}