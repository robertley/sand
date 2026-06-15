import { GameState } from "../interfaces/game-state.interface";
import { getAbstractCell } from "../scripts/helper";
import { Cell, CellType } from "./cell.class";

export class Game {

    width = 40;
    height = 30;
    sandCount = 0;
    lastSandAddTime = 0;
    mouseDropRate = 50;
    drawCell = CellType.SAND;
    timesIncreasedGrid = 0;
    sandPortalRate = 1;
    sandMultiplier = 1;

    mouseDown = false;
    mouseMove = false;
    mousePosX = 0;
    mousePosY = 0;
    mouseEntered = false;

    holdToSandUnlocked = true;

    grid: Cell[][] = [];
    // nextGrid: Cell[][] = [];

    _abortUpdate = false;
    _tickCount = 0;

    debugMode = true;

    constructor() {
    }

    newGame() {
        this.width = 40;
        this.height = 30;
        this.sandCount = 0;
        this.lastSandAddTime = 0;
        this.mouseDropRate = 50;
        this.drawCell = CellType.SAND;
        this.timesIncreasedGrid = 0;
        this.sandPortalRate = 1;
        this.sandMultiplier = 1;

        this.newGrid();
    }

    newGrid() {
        for (let y = 0; y < this.height; y++) {
            this.grid.push(Array.from({ length: this.width }, (_, x) => getAbstractCell(CellType.EMPTY, x, y)));
            // this.nextGrid.push(Array.from({ length: this.width }, (_, x) => new Cell(x, y, CellType.EMPTY)));
        } 
        // this.nextGrid = [];
    }

    loadGame(gameState: GameState) {
        this.width = gameState.width;
        this.height = gameState.height;
        this.sandCount = gameState.sandCount;
        this.lastSandAddTime = gameState.lastSandAddTime;
        this.mouseDropRate = gameState.mouseDropRate;
        this.drawCell = gameState.drawCell;
        this.timesIncreasedGrid = gameState.timesIncreasedGrid;
        this.sandPortalRate = gameState.sandPortalRate;
        this.sandMultiplier = gameState.sandMultiplier;
    }

    removeCell(x: number, y: number) {
        delete this.grid[y][x];
        this.grid[y][x] = getAbstractCell(CellType.EMPTY, x, y);
    }
}