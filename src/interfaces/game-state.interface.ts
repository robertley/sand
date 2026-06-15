import { Cell, CellType } from "../classes/cell.class";

export interface GameState {
    grid: Cell[][];
    nextGrid: Cell[][];
    width: number;
    height: number;
    sandCount: number;
    mouseDropRate: number;

    // mouse state
    mouseDown: boolean;
    mouseMove: boolean;
    mousePosX: number;
    mousePosY: number;
    mouseEntered: boolean;

    timesIncreasedGrid: number;
    lastSandAddTime: number;
    drawCell: CellType;

    // upgrades
    holdToSandUnlocked: boolean;
    sandPortalRate: number;
    sandMultiplier: number;

    // debug
    debugMode: boolean;

    // meta
    _abortUpdate: boolean;
    _tickCount: number;
}