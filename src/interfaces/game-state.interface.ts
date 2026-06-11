import { Cell } from "./cell.type";
import { Cell as CellAbstract } from "../classes/cell.class";

export interface GameState {
    grid: CellAbstract[][];
    nextGrid: CellAbstract[][];
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
    drawCell: Cell;

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