import { CANVAS, clearCanvas, GAME, increaseGridSize, newGame, saveGame, setGridSize, spendSand, updateSandCount } from "..";
import { Cell, CELL_TYPES, CellType } from "../classes/cell.class";
// import { Cell, CELL_TYPES } from "../interfaces/cell.type";

const CLEAR_BUTTON = document.getElementById('clearButton');
const DEBUG_BUTTON = document.getElementById('debug');
const HOLD_TO_SAND_BUTTON = document.getElementById('holdToSandButton');
const UPGRADE_SPS_BUTTON = document.getElementById('upgradeSPS');
const NEW_GAME_BUTTON = document.getElementById('newGameButton');
const SAVE_BUTTON = document.getElementById('save');
const UPGRADE_GRID_SIZE_BUTTON = document.getElementById('upgradeGridSize');
const SAND_BUTTON = document.getElementById('sandButton');
const DIRT_BUTTON = document.getElementById('dirtButton');
const WATER_BUTTON = document.getElementById('waterButton');
const HOLE_BUTTON = document.getElementById('holeButton');
const SAND_PORTAL_BUTTON = document.getElementById('sandPortalButton');
const STONE_BUTTON = document.getElementById('stoneButton');
const UPGRADE_SAND_MULTIPLIER_BUTTON = document.getElementById('upgradeSandMultiplierButton');
const FIRE_BUTTON = document.getElementById('fireButton');
const WATER_PORTAL_BUTTON = document.getElementById('waterPortalButton');
const TORCH_BUTTON = document.getElementById('torchButton');
const ERASER_BUTTON = document.getElementById('eraserButton');
const STEAM_ENGINE_BUTTON = document.getElementById('steamEngineButton');
const WIRE_BUTTON = document.getElementById('wireButton');
const SEED_BUTTON = document.getElementById('seedButton');
const FISH_BUTTON = document.getElementById('fishButton');

// @ts-ignore
NEW_GAME_BUTTON.onclick = function () {
    newGame();
    saveGame();
};
// @ts-ignore
CLEAR_BUTTON.onclick = function () {
    clearCanvas();
};
// @ts-ignore
DEBUG_BUTTON.onclick = function () {
    console.log(GAME);
    for (let x = 0; x < GAME.width; x++) {
        for (let y = 0; y < GAME.height; y++) {
            let cell = GAME.grid[y][x];
            if (cell.cellType !== CellType.EMPTY) {
                console.log(`Cell at (${x}, ${y}):`, cell);
            }
        }
    }
}

// @ts-ignore
SAVE_BUTTON.onclick = function () {
    saveGame();
}

// @ts-ignore
HOLD_TO_SAND_BUTTON.onclick = function () {
    if (GAME.sandCount >= 10) {
        spendSand('spend-hold-to-sand');
    }
}
// @ts-ignore
UPGRADE_SPS_BUTTON.onclick = function () {
    if (GAME.sandCount >= 100) {
        GAME.mouseDropRate += 5;
        updateSandCount(-100);
    }
}
// @ts-ignore
UPGRADE_GRID_SIZE_BUTTON.onclick = function () {
    if (GAME.sandCount >= 200) {
        setGridSize(GAME.width + 10, GAME.height + 10);
        updateSandCount(-200);
    }
}
// @ts-ignore
UPGRADE_SAND_MULTIPLIER_BUTTON.onclick = function () {
    if (GAME.sandCount >= 300) {
        GAME.sandMultiplier += 0.5;
        updateSandCount(-300);
    }
}
// @ts-ignore
SAND_BUTTON.onclick = function () {
    GAME.drawCell = CellType.SAND;
    updateCanvasClass(CellType.SAND);
}
// @ts-ignore
DIRT_BUTTON.onclick = function () {
    GAME.drawCell = CellType.DIRT;
    updateCanvasClass(CellType.DIRT);
}
// @ts-ignore
WATER_BUTTON.onclick = function () {
    GAME.drawCell = CellType.WATER;
    updateCanvasClass(CellType.WATER);
}
// @ts-ignore
HOLE_BUTTON.onclick = function () {
    GAME.drawCell = CellType.HOLE;
    updateCanvasClass(CellType.HOLE);
}
// @ts-ignore
FIRE_BUTTON.onclick = function () {
    GAME.drawCell = CellType.FIRE;
    updateCanvasClass(CellType.FIRE);
}
// @ts-ignore
SAND_PORTAL_BUTTON.onclick = function () {
    GAME.drawCell = CellType.SAND_PORTAL;
    updateCanvasClass(CellType.SAND_PORTAL);
}
// // @ts-ignore
STONE_BUTTON.onclick = function () {
    GAME.drawCell = CellType.STONE;
    updateCanvasClass(CellType.STONE);
}
// // @ts-ignore
WATER_PORTAL_BUTTON.onclick = function () {
    GAME.drawCell = CellType.WATER_PORTAL;
    updateCanvasClass(CellType.WATER_PORTAL);
}
// // @ts-ignore
// TORCH_BUTTON.onclick = function () {
//     GAME.drawCell = 'torch';
//     updateCanvasClass('torch');
// }
// // @ts-ignore
// ERASER_BUTTON.onclick = function () {
//     GAME.drawCell = 'empty';
//     updateCanvasClass('empty');
// }
// // @ts-ignore
// STEAM_ENGINE_BUTTON.onclick = function () {
//     GAME.drawCell = 'steam-engine-0';
//     updateCanvasClass('steam-engine-0');
// }
// // @ts-ignore
// WIRE_BUTTON.onclick = function () {
//     GAME.drawCell = 'wire';
//     updateCanvasClass('wire');
// }
// // @ts-ignore
// SEED_BUTTON.onclick = function () {
//     GAME.drawCell = 'seed';
//     updateCanvasClass('seed');
// }
// // @ts-ignore
// FISH_BUTTON.onclick = function () {
//     GAME.drawCell = 'fish';
//     updateCanvasClass('fish');
// }

function initDebugForm() {

}



export function updateCanvasClass(cellType: CellType) {
    for (let cellType of Array.from(CELL_TYPES)) {
        CANVAS.classList.remove(`draw-${cellType}`);
    }
    CANVAS.classList.add(`draw-${cellType}`);
}

console.log('buttons loaded');
console.log(DEBUG_BUTTON)


export function checkButtonsDisabled() {
    if (GAME.sandCount >= 10) {
        // @ts-ignore
        HOLD_TO_SAND_BUTTON.removeAttribute('disabled');
    } else {
        // @ts-ignore
        HOLD_TO_SAND_BUTTON.setAttribute('disabled', 'true');
    }

    if (GAME.sandCount >= 100) {
        // @ts-ignore
        UPGRADE_SPS_BUTTON.removeAttribute('disabled');
    } else {
        // @ts-ignore
        UPGRADE_SPS_BUTTON.setAttribute('disabled', 'true');
    }

    if (GAME.sandCount >= 200) {
        // @ts-ignore
        UPGRADE_GRID_SIZE_BUTTON.removeAttribute('disabled');
    } else {
        // @ts-ignore
        UPGRADE_GRID_SIZE_BUTTON.setAttribute('disabled', 'true');
    }

    if (GAME.sandCount >= 300) {
        // @ts-ignore
        UPGRADE_SAND_MULTIPLIER_BUTTON.removeAttribute('disabled');
    } else {
        // @ts-ignore
        UPGRADE_SAND_MULTIPLIER_BUTTON.setAttribute('disabled', 'true');
    }
}