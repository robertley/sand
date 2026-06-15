import { ADD_CELL_MAP, CANVAS, GAME, getCellAtPos, TARGET_FPS, updateSandCount } from "..";
import { CellType } from "../classes";
import { getAbstractCell } from "./helper";

const NON_BLOOM_CELL_TYPES_OLD = ['stone', 'hole', 'sand-portal-0', 'water-portal', 'torch', 'empty', 'steam-engine-0', 'wire'];
const NON_BLOOM_CELL_TYPES = new Set<CellType>([CellType.STONE, CellType.HOLE, CellType.SAND_PORTAL, CellType.WATER_PORTAL, CellType.TORCH, CellType.EMPTY, CellType.STEAM_ENGINE, CellType.WIRE]);
const MAX_DROP_RATE_TYPES = new Set<CellType>([CellType.SEED, CellType.FISH]);
const MAX_DROP_RATE = 5;

function getMousePosCell(e: MouseEvent) {
    const rect = CANVAS.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const squareSizeWidth = Math.floor(CANVAS.width / GAME.width);
    const squareSizeHeight = Math.floor(CANVAS.height / GAME.height);
    const gridX = Math.floor(x / squareSizeWidth);
    const gridY = Math.floor(y / squareSizeHeight);
    return { x: gridX, y: gridY };
}

export function clickHandler() {
    CANVAS.onclick = function (e) {
        if (GAME.holdToSandUnlocked) {
            return;
        }
        addCellAtMouse(getMousePosCell(e));
        if (GAME.drawCell === CellType.SAND) {
            updateSandCount();
        }
    };

    // on mouse hold, continually add sand on the mouse position
    CANVAS.onmousedown = function (e) {
        GAME.mouseDown = true;
    }

    CANVAS.onmouseup = function (e) {
        GAME.mouseDown = false;
    }

    CANVAS.onmousemove = function (e) {
        GAME.mouseMove = true;
        let { x, y } = getMousePosCell(e);
        GAME.mousePosX = x;
        GAME.mousePosY = y;
    }

    CANVAS.onmouseleave = function (e) {
        GAME.mouseDown = false;
        GAME.mouseEntered = false;
    }

    CANVAS.onmouseenter = function (e) {
        GAME.mouseEntered = true;
    }
}

export function holdSpawnUpdate() {

    let now = Date.now();

    let sandPerSecond = GAME.mouseDropRate;
    if (MAX_DROP_RATE_TYPES.has(GAME.drawCell)) {
        sandPerSecond = MAX_DROP_RATE;
    }
    
    if (
        GAME.mouseDown &&
        GAME.mouseEntered &&
        (
            (
                GAME.lastSandAddTime + (1000 / sandPerSecond) < now &&
                GAME.holdToSandUnlocked
            ) ||
            NON_BLOOM_CELL_TYPES.has(GAME.drawCell)
        )
    ) {
        let sandSpawnAmt = sandPerSecond / TARGET_FPS;
        for (let i = 0; i < sandSpawnAmt; i++) {
            addCellAtMouse({x: GAME.mousePosX, y: GAME.mousePosY});
            if (GAME.drawCell === CellType.SAND) {
                updateSandCount();
            }
        }
        GAME.lastSandAddTime = now;
    }
}

function addCellAtMouse({x, y}: {x: number, y: number}) {

    let cellAtPos = getCellAtPos(x, y);
    let cellAtRight = getCellAtPos(x + 1, y);
    let cellAtLeft = getCellAtPos(x - 1, y);
    let cellAtBelow = getCellAtPos(x, y + 1);
    let cellAtAbove = getCellAtPos(x, y - 1);
    let cellAtAboveLeft = getCellAtPos(x - 1, y - 1);
    let cellAtAboveRight = getCellAtPos(x + 1, y - 1);
    let cellAtBelowLeft = getCellAtPos(x - 1, y + 1);
    let cellAtBelowRight = getCellAtPos(x + 1, y + 1);

    if (cellAtPos === null) {
        console.error(`Error adding cell at mouse: cellAtPos is null`);
        return;
    }

    let cellType = cellAtPos.cellType;

    let emptyCells = [];
    if (cellType !== CellType.EMPTY && !NON_BLOOM_CELL_TYPES.has(GAME.drawCell)) {
        if (cellAtRight?.cellType === CellType.EMPTY) {
            emptyCells.push('right');
        }
        if (cellAtLeft?.cellType === CellType.EMPTY) {
            emptyCells.push('left');
        }
        if (cellAtBelow?.cellType === CellType.EMPTY) {
            emptyCells.push('below');
        }
        if (cellAtAbove?.cellType === CellType.EMPTY) {
            emptyCells.push('above');
        }
        if (cellAtBelowRight?.cellType === CellType.EMPTY) {
            emptyCells.push('below-right');
        }
        if (cellAtBelowLeft?.cellType === CellType.EMPTY) {
            emptyCells.push('below-left');
        }
        if (cellAtAboveRight?.cellType === CellType.EMPTY) {
            emptyCells.push('above-right');
        }
        if (cellAtAboveLeft?.cellType === CellType.EMPTY) {
            emptyCells.push('above-left');
        }
    }

    if (emptyCells.length > 0) {
        const choice = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        switch (choice) {
            case 'right':
                x = x + 1;
                break;
            case 'left':
                x = x - 1;
                break;
            case 'below':
                y = y + 1;
                break;
            case 'above':
                y = y - 1;
                break;
            case 'below-right':
                x = x + 1;
                y = y + 1;
                break;
            case 'below-left':
                x = x - 1;
                y = y + 1;
                break;
            case 'above-right':
                x = x + 1;
                y = y - 1;
                break;
            case 'above-left':
                x = x - 1;
                y = y - 1;
                break;
        }
    }

    if (x < 0 || x >= GAME.width || y < 0 || y >= GAME.height) {
        return;
    }

    // let finalCell = checkSpecialCell(GAME.drawCell);
    ADD_CELL_MAP.set(`${x},${y}`, { x, y, cell: getAbstractCell(GAME.drawCell, x, y) });
}

// function checkSpecialCell(cell: CellType): CellType {
//     let returnCell: CellType = cell;
//     switch (cell) {
//         case CellType.FISH:
//             let fishTypeId = Math.floor(Math.random() * 3);
//             returnCell = `fish-pending-5-${fishTypeId}` as unknown as CellType;
//     }
//     return returnCell;
// }