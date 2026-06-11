import { GAME_STATE } from "..";
import { Empty } from "./empty.class";


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
    WATER_PORTAL
}

export abstract class Cell {

    abstract cellType: CellType;
    
    x: number;
    y: number;
    fallable: boolean = false;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    abstract automata(x: number, y: number): void;

    sit() {
        GAME_STATE.nextGrid[this.y][this.x] = this;
    }

    fall() {
        if (this.tryFallInHole(this.S)) {
            return;
        }

        GAME_STATE.nextGrid[this.y + 1][this.x] = this;
        GAME_STATE.nextGrid[this.y][this.x] = this.S;
    }

    tryFallInHole(cell: Cell): boolean {
        if (cell.cellType === CellType.HOLE) {
            GAME_STATE.nextGrid[this.y][this.x] = new Empty(this.x, this.y);
            return true;
        }
        return false;
    }

    move(destinationCell: Cell) {
        GAME_STATE.nextGrid[destinationCell.y][destinationCell.x] = this;
        GAME_STATE.nextGrid[this.y][this.x] = destinationCell;
    }

    get canFall() {
        return this.S == null ? false : this.S.fallable;
    }

    get W() {
        return this.x - 1 >= 0 ? GAME_STATE.nextGrid[this.y][this.x - 1] : null;
    }

    get N() {
        return this.y - 1 >= 0 ? GAME_STATE.nextGrid[this.y - 1][this.x] : null;
    }

    get E() {
        return this.x + 1 < GAME_STATE.width ? GAME_STATE.nextGrid[this.y][this.x + 1] : null;
    }

    get S() {
        return this.y + 1 < GAME_STATE.height ? GAME_STATE.nextGrid[this.y + 1][this.x] : null;
    }

    get NW() {
        return this.x - 1 >= 0 && this.y - 1 >= 0 ? GAME_STATE.nextGrid[this.y - 1][this.x - 1] : null;
    }

    get NE() {
        return this.x + 1 < GAME_STATE.width && this.y - 1 >= 0 ? GAME_STATE.nextGrid[this.y - 1][this.x + 1] : null;
    }

    get SW() {
        return this.x - 1 >= 0 && this.y + 1 < GAME_STATE.height ? GAME_STATE.nextGrid[this.y + 1][this.x - 1] : null;
    }

    get SE() {
        return this.x + 1 < GAME_STATE.width && this.y + 1 < GAME_STATE.height ? GAME_STATE.nextGrid[this.y + 1][this.x + 1] : null;
    }
}
