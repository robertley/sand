import { Cell } from "./cell.type";

export interface GameState {
    grid: Cell[][];
    nextGrid: Cell[][];
    width: number;
    height: number;
    sandCount: number;
    sandPerSecond: number;

    // mouse state
    mouseDown: boolean;
    mouseMove: boolean;
    mousePosX: number;
    mousePosY: number;
    mouseEntered: boolean;

    timesIncreasedGrid: number;
    lastSandAddTime: number;
    drawCell: Cell;

    // upgrades
    holdToSandUnlocked: boolean;
    sandPortalRate: number;
    sandMultiplier: number;

    // meta
    _abortUpdate: boolean;
    _tickCount: number;
}