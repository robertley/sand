import { CANVAS, clearCanvas, GAME_STATE, increaseGridSize, newGame, saveGame, setGridSize, spendSand, updateSandCount } from "..";
import { Cell, CELL_TYPES } from "../interfaces/cell.type";

const CLEAR_BUTTON = document.getElementById('clearButton');
const DEBUG_BUTTON = document.getElementById('debug');
const HOLD_TO_SAND_BUTTON = document.getElementById('holdToSandButton');
const UPGRADE_SPS_BUTTON = document.getElementById('upgradeSPS');
const NEW_GAME_BUTTON = document.getElementById('newGameButton');
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

NEW_GAME_BUTTON.onclick = function () {
    newGame();
    saveGame();
};

CLEAR_BUTTON.onclick = function () {
    clearCanvas();
};

DEBUG_BUTTON.onclick = function () {
    console.log(GAME_STATE);
}

HOLD_TO_SAND_BUTTON.onclick = function () {
    if (GAME_STATE.sandCount >= 10) {
        spendSand('spend-hold-to-sand');
    }
}

UPGRADE_SPS_BUTTON.onclick = function () {
    if (GAME_STATE.sandCount >= 100) {
        GAME_STATE.mouseDropRate += 5;
        updateSandCount(-100);
    }
}

UPGRADE_GRID_SIZE_BUTTON.onclick = function () {
    if (GAME_STATE.sandCount >= 200) {
        setGridSize(GAME_STATE.width + 10, GAME_STATE.height + 10);
        updateSandCount(-200);
    }
}

UPGRADE_SAND_MULTIPLIER_BUTTON.onclick = function () {
    if (GAME_STATE.sandCount >= 300) {
        GAME_STATE.sandMultiplier += 0.5;
        updateSandCount(-300);
    }
}

SAND_BUTTON.onclick = function () {
    GAME_STATE.drawCell = 'sand';
    updateCanvasClass('sand');
}

DIRT_BUTTON.onclick = function () {
    GAME_STATE.drawCell = 'dirt';
    updateCanvasClass('dirt');
}

WATER_BUTTON.onclick = function () {
    GAME_STATE.drawCell = 'water';
    updateCanvasClass('water');
}

HOLE_BUTTON.onclick = function () {
    GAME_STATE.drawCell = 'hole';
    updateCanvasClass('hole');
}

FIRE_BUTTON.onclick = function () {
    GAME_STATE.drawCell = 'fire-0';
    updateCanvasClass('fire-0');
}

SAND_PORTAL_BUTTON.onclick = function () {
    GAME_STATE.drawCell = 'sand-portal-0';
    updateCanvasClass('sand-portal-0');
}

STONE_BUTTON.onclick = function () {
    GAME_STATE.drawCell = 'stone';
    updateCanvasClass('stone');
}

WATER_PORTAL_BUTTON.onclick = function () {
    GAME_STATE.drawCell = 'water-portal';
    updateCanvasClass('water-portal');
}

TORCH_BUTTON.onclick = function () {
    GAME_STATE.drawCell = 'torch';
    updateCanvasClass('torch');
}

ERASER_BUTTON.onclick = function () {
    GAME_STATE.drawCell = 'empty';
    updateCanvasClass('empty');
}

STEAM_ENGINE_BUTTON.onclick = function () {
    GAME_STATE.drawCell = 'steam-engine-0';
    updateCanvasClass('steam-engine-0');
}

WIRE_BUTTON.onclick = function () {
    GAME_STATE.drawCell = 'wire';
    updateCanvasClass('wire');
}

SEED_BUTTON.onclick = function () {
    GAME_STATE.drawCell = 'seed';
    updateCanvasClass('seed');
}

FISH_BUTTON.onclick = function () {
    GAME_STATE.drawCell = 'fish';
    updateCanvasClass('fish');
}

function initDebugForm() {

}



export function updateCanvasClass(cellType: Cell) {
    for (let cellType of CELL_TYPES) {
        CANVAS.classList.remove(`draw-${cellType}`);
    }
    CANVAS.classList.add(`draw-${cellType}`);
}

console.log('buttons loaded');
console.log(DEBUG_BUTTON)


export function checkButtonsDisabled() {
    if (GAME_STATE.sandCount >= 10) {
        HOLD_TO_SAND_BUTTON.removeAttribute('disabled');
    } else {
        HOLD_TO_SAND_BUTTON.setAttribute('disabled', 'true');
    }

    if (GAME_STATE.sandCount >= 100) {
        UPGRADE_SPS_BUTTON.removeAttribute('disabled');
    } else {
        UPGRADE_SPS_BUTTON.setAttribute('disabled', 'true');
    }

    if (GAME_STATE.sandCount >= 200) {
        UPGRADE_GRID_SIZE_BUTTON.removeAttribute('disabled');
    } else {
        UPGRADE_GRID_SIZE_BUTTON.setAttribute('disabled', 'true');
    }

    if (GAME_STATE.sandCount >= 300) {
        UPGRADE_SAND_MULTIPLIER_BUTTON.removeAttribute('disabled');
    } else {
        UPGRADE_SAND_MULTIPLIER_BUTTON.setAttribute('disabled', 'true');
    }
}