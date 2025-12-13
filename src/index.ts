import './index.scss';
import { GameState } from './interfaces/game-state.interface';
import { Interaction } from './interfaces/interaction.type';
import { Cell } from './interfaces/cell.type';
import { checkButtonsDisabled, updateCanvasClass } from './scripts/buttons';
import { dirtAutomata, fireAutomata, portalAutomata, portalAutomataUp, sandAutomata, seedAutomata, gasAutomata, steamEngineAutomata, waterAutomata, waterAutomataBuoyancy, wireAutomata, wetDirtWithSeedAutomata, trunkAutomata, seaweedAutomata, fishAutomata } from './scripts/automata';
import { clickHandler, holdSpawnUpdate } from './scripts/controls';
import { formInit } from './scripts/form';
import { updateStatsUI } from './scripts/stats';

export const GAME_STATE = {} as GameState;
export const CANVAS = document.querySelector('canvas') as HTMLCanvasElement;
export const TARGET_FPS = 60;
export const ADD_CELL_MAP = new Map<string, { x: number, y: number, type: Cell }>();

const BACKGROUND_COLOR = '#0e0808';

// todo try and use a map to help with performance?

const STATIC_CELLS = ['empty', 'hole', 'stone'];

export let fpsCurrent = 0;

export function newGame() {
    GAME_STATE.width = 40;
    GAME_STATE.height = 30;
    GAME_STATE.sandCount = 0;
    GAME_STATE.lastSandAddTime = 0;
    GAME_STATE.mouseDropRate = 2;
    GAME_STATE.drawCell = 'sand';
    GAME_STATE.timesIncreasedGrid = 0;
    GAME_STATE.sandPortalRate = 1;
    GAME_STATE.sandMultiplier = 1;

    GAME_STATE.mouseDown = false;
    GAME_STATE.mouseMove = false;

    GAME_STATE.holdToSandUnlocked = false;

    clearCanvas();
}

function init() {
    loadGame();
    if (!GAME_STATE.grid) {
        newGame();
    }

    GAME_STATE._abortUpdate = false;
    GAME_STATE._tickCount = 0;
    clickHandler();
    setInterval(saveGame, 10000);
    drawCanvas(true);
    updateCanvasClass(GAME_STATE.drawCell);

    let msPrev = window.performance.now()
    const fps = 60
    const msPerFrame = 1000 / fps
    let frames = 0

    function animate() {
        window.requestAnimationFrame(animate)

        const msNow = window.performance.now()
        const msPassed = msNow - msPrev

        if (msPassed < msPerFrame) return

        const excessTime = msPassed % msPerFrame
        msPrev = msNow - excessTime

        fpsCurrent = 1000 / msPassed
        try {
            update();
        } catch (e) {
            console.log(GAME_STATE);
            console.error('Error during update:', e);
            // stop update loop
            window.cancelAnimationFrame(animate as unknown as number);
            return;
        }
        frames++
    }

    animate();
    formInit();
}


init();

let prevFillStyle = '';

function drawCanvas(skipOptimization = false) {
    const ctx = CANVAS.getContext('2d');

    const gridSizeWidth = GAME_STATE.width;
    const gridSizeHeight = GAME_STATE.height;
    const squareSizeWidth = Math.floor(CANVAS.width / gridSizeWidth);
    const squareSizeHeight = Math.floor(CANVAS.height / gridSizeHeight);

    let holes: { x: number, y: number }[] = [];
    let steamEngines: { x: number, y: number, type: Cell }[] = [];
    let wires: { x: number, y: number, type: Cell }[] = [];
    const SKIP_DRAW_CELLS = ['hole', 'steam-engine-0', 'steam-engine-1', 'steam-engine-2', 'steam-engine-3', 'steam-engine-4', 'wire'];

    for (let y = 0; y < gridSizeHeight; y++) {
        for (let x = 0; x < gridSizeWidth; x++) {
            let cell = GAME_STATE.nextGrid[y][x];
            let genericCellType = getGenericCellType(cell);
            if (
                !skipOptimization &&
                !SKIP_DRAW_CELLS.includes(genericCellType) &&
                GAME_STATE.grid[y][x] === genericCellType &&
                ADD_CELL_MAP.get(`${x},${y}`) === undefined
            ) {
                continue;
            }
            

            let fillStyle: string;
            switch (genericCellType) {
                case 'sand':
                    fillStyle = '#c2b280';
                    break;
                case 'dirt':
                    fillStyle = '#7a5230';
                    break;
                case 'wet-dirt':
                    fillStyle = '#5a3d24';
                    break;
                case 'dirt-with-seed':
                    fillStyle = '#2e5515ff';
                    break;
                case 'wet-dirt-with-seed':
                    fillStyle = '#172e09ff';
                    break;
                case 'water':
                case 'water-left':
                case 'water-right':
                    fillStyle = '#3399ff';
                    break;
                case 'stone':
                    fillStyle = '#5c5c5cff';
                    break;
                case 'hole':
                    holes.push({ x, y });
                    break;
                case 'sand-portal-0':
                case 'sand-portal-1':
                case 'sand-portal-2':
                case 'sand-portal-3':
                case 'sand-portal-4':
                case 'sand-portal-5':
                case 'sand-portal-6':
                case 'sand-portal-7':
                case 'sand-portal-8':
                    fillStyle = '#b889b0ff';
                    break;
                case 'water-portal':
                    fillStyle = '#6688ffff';
                    break;
                case 'steam':
                    fillStyle = '#d3d3d375';
                    break;
                case 'fire-0':
                    fillStyle = '#990000'
                    break;
                case 'fire-1':
                    fillStyle = '#cc0000'
                    break;
                case 'fire-2':
                    fillStyle = '#ff0000';
                    break;
                case 'fire-3':
                    fillStyle = '#ff3300'
                    break;
                case 'fire-4':
                    fillStyle = '#ff6600'
                    break;
                case 'torch':
                    fillStyle = '#3d1401'
                    break;
                case 'steam-engine-0':
                case 'steam-engine-1':
                case 'steam-engine-2':
                case 'steam-engine-3':
                case 'steam-engine-4':
                    steamEngines.push({ x, y, type: cell });
                    break;
                case 'wire':
                case 'wire-p-l':
                case 'wire-p-r':
                case 'wire-p-u':
                case 'wire-p-d':
                    wires.push({ x, y, type: cell });
                    break;
                case 'empty':
                    fillStyle = null;
                    break;
                case 'seed':
                    fillStyle = '#bb6400ff';
                    break;
                // case 'water-vapor-0':
                //     fillStyle = '#7ee1ff34';
                //     break;
                // case 'water-vapor-1':
                //     fillStyle = '#7ee1ff68';
                //     break;
                // case 'water-vapor-2':
                //     fillStyle = '#7ee1ffA6';
                //     break;
                // case 'water-vapor-3':
                //     fillStyle = '#7ee1ffD2';
                //     break;
                // case 'water-vapor-4':
                //     fillStyle = '#7ee1ffFF';
                //     break;
                // gradient from 7ee1ff34 to FFFFFF
                case 'water-vapor-0':
                    fillStyle = '#7ee1ff93';
                    break;
                case 'water-vapor-1':
                    fillStyle = '#9fe4ff93';
                    break;
                case 'water-vapor-2':
                    fillStyle = '#c0e7ff93';
                    break;
                case 'water-vapor-3':
                    fillStyle = '#e1f0ff93';
                    break;
                case 'water-vapor-4':
                    fillStyle = '#ffffff93';
                    break;
                case 'trunk':
                    let trunkColor = cell.split('-')[3];
                    fillStyle = trunkColor;
                    break;
                case 'seaweed':
                    let heightIndex = +cell.split('-')[1];
                    let tickCount = +cell.split('-')[2];
                    let green = 140;
                    let greenOffsetComparorator = (GAME_STATE._tickCount + tickCount + (heightIndex * 10)) % 40;
                    if (greenOffsetComparorator % 40 < 10) {
                        green += 8;
                    } else if (greenOffsetComparorator % 40 < 20) {
                        green += 16;
                    } else if (greenOffsetComparorator % 40 < 30) {
                        green += 24;
                    } else if (greenOffsetComparorator % 40 < 40) {
                        green += 16;
                    }

                    let greenHex = green.toString(16).padStart(2, '0');
                    let color = `#00${greenHex}00`;
                    fillStyle = color;
                    break;
                case 'fish':
                    fillStyle = '#ff9900ff';
                    break;
                default:
                    console.log('unknown cell type in drawCanvas:', cell);
                    fillStyle = 'rgba(255, 0, 212, 1)';
            }

            if (SKIP_DRAW_CELLS.includes(cell)) {
                continue;
            }

            ctx.fillStyle = fillStyle;
            const px = Math.floor(x * squareSizeWidth);
            const py = Math.floor(y * squareSizeHeight);
            // ctx.strokeRect(px, py, squareSizeWidth, squareSizeHeight);
            if (fillStyle) {
                ctx.fillRect(px, py, squareSizeWidth, squareSizeHeight);
            } else {
                ctx.clearRect(px, py, squareSizeWidth, squareSizeHeight);
            }

        }
    }



    // draw holes

    // do background square first to have a shadow effect
    for (let hole of holes) {
        ctx.fillStyle = '#4444ffff';
        const px = Math.floor(hole.x * squareSizeWidth);
        const py = Math.floor(hole.y * squareSizeHeight);
        ctx.fillRect(px - 1, py - 1, squareSizeWidth + 2, squareSizeHeight + 2);
    }

    for (let hole of holes) {
        ctx.fillStyle = '#000000';
        const px = Math.floor(hole.x * squareSizeWidth);
        const py = Math.floor(hole.y * squareSizeHeight);
        ctx.fillRect(px, py, squareSizeWidth, squareSizeHeight);
    }

    for (let engine of steamEngines) {
        // draw background shadow
        ctx.fillStyle = '#aaaa00ff';
        const px = Math.floor(engine.x * squareSizeWidth);
        const py = Math.floor(engine.y * squareSizeHeight);
        ctx.fillRect(px - 1, py - 1, squareSizeWidth + 2, squareSizeHeight + 2);
    }

    for (let engine of steamEngines) {
        let fillStyle: string;
        switch (engine.type) {
            case 'steam-engine-0':
                fillStyle = '#252525';
                break;
            case 'steam-engine-1':
                fillStyle = '#4C2E1F';
                break;
            case 'steam-engine-2':
                fillStyle = '#734719';
                break;
            case 'steam-engine-3':
                fillStyle = '#9A6013';
                break;
            case 'steam-engine-4':
                fillStyle = '#B9450B';
                break;
        }
        ctx.fillStyle = fillStyle;
        const px = Math.floor(engine.x * squareSizeWidth);
        const py = Math.floor(engine.y * squareSizeHeight);
        ctx.fillRect(px, py, squareSizeWidth, squareSizeHeight);
    }

    for (let wire of wires) {
        // draw background shadow
        ctx.fillStyle = '#ffffffff';
        const px = Math.floor(wire.x * squareSizeWidth);
        const py = Math.floor(wire.y * squareSizeHeight);
        ctx.fillRect(px - 1, py - 1, squareSizeWidth + 2, squareSizeHeight + 2);
    }

    for (let wire of wires) {
        let fillStyle = '#ffff00ff';
        if (wire.type == 'wire') {
            fillStyle = '#0f0427ff';
        }
        ctx.fillStyle = fillStyle;
        const px = Math.floor(wire.x * squareSizeWidth);
        const py = Math.floor(wire.y * squareSizeHeight);
        ctx.fillRect(px, py, squareSizeWidth, squareSizeHeight);
    }

}

function update() {
    if (GAME_STATE._abortUpdate) {
        return;
    }
    holdSpawnUpdate();
    addCellMapCells();
    runCellularAutomata();
    drawCanvas();
    updateGameStateGrid();
    updateStatsUI();
    updateSandPerSecond();
    ADD_CELL_MAP.clear();
    GAME_STATE._tickCount++;
}


function addCellMapCells() {
    ADD_CELL_MAP.forEach((value, key) => {
        try {
            GAME_STATE.grid[value.y][value.x] = value.type;
            GAME_STATE.nextGrid[value.y][value.x] = value.type;
        } catch (e) {
            console.error('Error adding cell at', value, 'with key', key);
        }

    });
}

export function getCellAtPos(x: number, y: number): Cell {
    if (x < 0 || x >= GAME_STATE.width || y < 0 || y >= GAME_STATE.height) {
        return null;
    }
    if (ADD_CELL_MAP.has(`${x},${y}`)) {
        return ADD_CELL_MAP.get(`${x},${y}`).type;
    }
    return GAME_STATE.grid[y][x];
}

function runCellularAutomata() {
    let cellsToProcess: { x: number, y: number, type: Cell }[] = [];
    for (let y = GAME_STATE.height - 1; y >= 0; y--) {
        for (let x = 0; x < GAME_STATE.width; x++) {
            const cell = GAME_STATE.grid[y][x];
            if (STATIC_CELLS.includes(cell)) {
                continue;
            }
            cellsToProcess.push({ x, y, type: cell });
        }
    }

    // shuffle cellsToProcess to randomize processing order
    for (let i = cellsToProcess.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cellsToProcess[i], cellsToProcess[j]] = [cellsToProcess[j], cellsToProcess[i]];
    }

    for (let cell of cellsToProcess) {
        let genericType = getGenericCellType(cell.type);
        switch (genericType) {
            case 'sand':
                sandAutomata(cell.x, cell.y, cell.type);
                break;
            case 'wet-dirt-with-seed':
                wetDirtWithSeedAutomata(cell.x, cell.y, cell.type);
            case 'dirt':
            case 'wet-dirt':
            case 'dirt-with-seed':
                dirtAutomata(cell.x, cell.y, cell.type);
                break;
            case 'water':
            case 'water-left':
            case 'water-right':
                waterAutomata(cell.x, cell.y, cell.type);
                break;
            case 'sand-portal-1':
            case 'sand-portal-2':
            case 'sand-portal-3':
            case 'sand-portal-4':
            case 'sand-portal-5':
            case 'sand-portal-6':
            case 'sand-portal-7':
            case 'sand-portal-8':
            case 'water-portal':
                portalAutomata(cell.x, cell.y, cell.type);
                break;
            case 'fire-0':
            case 'fire-1':
            case 'fire-2':
            case 'fire-3':
            case 'fire-4':
                fireAutomata(cell.x, cell.y, cell.type);
                break;
            case 'steam':
            case 'water-vapor-0':
            case 'water-vapor-1':
            case 'water-vapor-2':
            case 'water-vapor-3':
            case 'water-vapor-4':
                gasAutomata(cell.x, cell.y, cell.type);
                break;
            case 'torch':
                portalAutomataUp(cell.x, cell.y, cell.type);
                break;
            case 'steam-engine-0':
            case 'steam-engine-1':
            case 'steam-engine-2':
            case 'steam-engine-3':
            case 'steam-engine-4':
                steamEngineAutomata(cell.x, cell.y, cell.type);
                break;
            case 'wire-p-l':
            case 'wire-p-r':
            case 'wire-p-u':
            case 'wire-p-d':
                wireAutomata(cell.x, cell.y, cell.type);
                break;
            case 'seed':
                seedAutomata(cell.x, cell.y, cell.type);
                break;
            case 'trunk':
                trunkAutomata(cell.x, cell.y, cell.type);
                break;
            case 'seaweed':
                seaweedAutomata(cell.x, cell.y, cell.type);
                break;
            case 'fish':
                fishAutomata(cell.x, cell.y, cell.type);
                break;
        }
    }


    // bouyancy pass
    for (let y = GAME_STATE.height - 1; y >= 0; y--) {
        for (let x = 0; x < GAME_STATE.width; x++) {
            const cell = GAME_STATE.nextGrid[y][x];
            switch (cell) {
                case 'sand':
                case 'dirt':
                case 'wet-dirt':
                case 'seed':
                    waterAutomataBuoyancy(x, y, cell);
                    break;
            }
        }
    }

}

function updateGameStateGrid() {
    // copy nextGrid to grid and reset nextGrid
    for (let y = 0; y < GAME_STATE.height; y++) {
        for (let x = 0; x < GAME_STATE.width; x++) {
            GAME_STATE.grid[y][x] = GAME_STATE.nextGrid[y][x];
        }
    }

}

let sandThisSecond = 0;
export let sandLastSecond = 0;
let lastSandCountUpdateTime = Date.now();

export function updateSandCount(amt=1) {
    let multAmt = amt;
    if (amt > 0) {
        multAmt = amt * (GAME_STATE.sandMultiplier || 1);
        sandThisSecond += multAmt;
    }
    GAME_STATE.sandCount += multAmt;

    checkButtonsDisabled();
}

function updateSandPerSecond() {
    let now = Date.now();
    if (now - lastSandCountUpdateTime >= 1000) {
        sandLastSecond = sandThisSecond;
        sandThisSecond = 0;
        lastSandCountUpdateTime = now;
    }
}

export function clearCanvas() {
    // set grid to 2d array of nulls
    GAME_STATE.grid = Array.from({ length: GAME_STATE.height }, () =>
        Array.from({ length: GAME_STATE.width }, () => 'empty')
    );
    GAME_STATE.nextGrid = Array.from({ length: GAME_STATE.height }, () =>
        Array.from({ length: GAME_STATE.width }, () => 'empty')
    );
    drawCanvas(true);
    checkButtonsDisabled();
}

export function increaseGridSize() {
    let amtWidth = (GAME_STATE.timesIncreasedGrid + 1) * 10;
    let amtHeight = Math.floor(amtWidth / (40 / 30));
    GAME_STATE.timesIncreasedGrid += 1;
    for (let y = 0; y < GAME_STATE.height; y++) {
        for (let x = 0; x < amtWidth; x++) {
            GAME_STATE.grid[y].push('empty');
            GAME_STATE.nextGrid[y].push('empty');
        }
    }

    for (let y = 0; y < amtHeight; y++) {
        GAME_STATE.grid.push(Array.from({ length: GAME_STATE.width + amtWidth }, () => 'empty'));
        GAME_STATE.nextGrid.push(Array.from({ length: GAME_STATE.width + amtWidth }, () => 'empty'));
    }

    GAME_STATE.width = GAME_STATE.width + amtWidth;
    GAME_STATE.height = GAME_STATE.height + amtHeight;
    CANVAS.getContext('2d').clearRect(0, 0, CANVAS.width, CANVAS.height);
    drawCanvas(true);
}

export function setGridSize(width: number, height: number) {
    GAME_STATE.width = width;
    GAME_STATE.height = height;
    let grid = GAME_STATE.grid;
    let nextGrid = GAME_STATE.nextGrid;

    if (grid.length > height) {
        grid.length = height;
        nextGrid.length = height;
    }

    for (let y = 0; y < GAME_STATE.height; y++) {
        if (grid.length < height) {
            grid.push(Array.from({ length: GAME_STATE.width }, () => 'empty'));
            nextGrid.push(Array.from({ length: GAME_STATE.width }, () => 'empty'));
        }
        for (let x = 0; x < GAME_STATE.width; x++) {
            if (grid[y].length < width) {
                grid[y].push('empty');
                nextGrid[y].push('empty');
            }
        }
    }

    CANVAS.getContext('2d').clearRect(0, 0, CANVAS.width, CANVAS.height);
    drawCanvas(true);
}

export function spendSand(interaction: Interaction) {
    switch (interaction) {
        case 'spend-hold-to-sand':
            acquireHoldToSand();
            break;
    }
}

function acquireHoldToSand() {
    updateSandCount(-10);
    GAME_STATE.holdToSandUnlocked = true;
}

export function saveGame() {
    console.log('Game saved.');
    localStorage.setItem('idle-sand-save', JSON.stringify(GAME_STATE));
}

function loadGame() {
    const save = localStorage.getItem('idle-sand-save');
    if (save) {
        const loadedState = JSON.parse(save) as GameState;
        Object.assign(GAME_STATE, loadedState);
        checkButtonsDisabled();
        console.log('Game loaded.');
    }
}


function getGenericCellType(cellType: Cell): string {
    if (cellType.startsWith('wet-dirt-with-seed-')) {
        return 'wet-dirt-with-seed';
    }
    if (cellType.startsWith('trunk-')) {
        return 'trunk';
    }
    if (cellType.startsWith('seaweed-')) {
        return 'seaweed';
    }
    if (cellType.startsWith('fish-')) {
        return 'fish';
    }
    return cellType;
}