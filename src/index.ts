import './index.scss';
import { Interaction } from './interfaces/interaction.type';
import { checkButtonsDisabled, updateCanvasClass } from './scripts/buttons';
// import { dirtAutomata, fireAutomata, portalAutomata, portalAutomataUp, sandAutomata, seedAutomata, gasAutomata, steamEngineAutomata, waterAutomata, waterAutomataBuoyancy, wireAutomata, wetDirtWithSeedAutomata, trunkAutomata, seaweedAutomata, fishAutomata } from './scripts/automata';
import { clickHandler, holdSpawnUpdate } from './scripts/controls';
import { formInit } from './scripts/form';
import { updateStatsUI } from './scripts/stats';
import { Sand, Cell as CellAbstract, CellType, Empty, Cell, Game, Fire } from './classes';
import { getAbstractCell } from './scripts/helper';
import { GameState } from './interfaces/game-state.interface';
import { AutomataCell } from './classes/automata-cell.class';

export const GAME = new Game();
export const CANVAS = document.querySelector('canvas') as HTMLCanvasElement;
export const TARGET_FPS = 60;
export const ADD_CELL_MAP = new Map<string, { x: number, y: number, cell: CellAbstract }>();

const BACKGROUND_COLOR = '#0e0808';

// todo try and use a map to help with performance?

const STATIC_CELLS = new Set<CellType>([CellType.EMPTY, CellType.HOLE, CellType.STEAM_ENGINE, CellType.WIRE, CellType.STONE]);
const SKIP_DRAW_CELLS = new Set<CellType>([CellType.HOLE, CellType.STEAM_ENGINE, CellType.WIRE]);

export let fpsCurrent = 0;

export function newGame() {
    
    clearCanvas();

    GAME.newGame();

    console.log('New game started');
}

function init() {
    loadGame();

    GAME._abortUpdate = false;
    GAME._tickCount = 0;
    clickHandler();
    setInterval(saveGame, 10000);
    drawCanvas(true);
    updateCanvasClass(GAME.drawCell);

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
            GAME._abortUpdate = true;
            // stop update loop
            window.cancelAnimationFrame(animate as unknown as number);
            console.error('Error during update:', e);

            return;
        }
        frames++
    }
    // setTimeout(() => {
        animate();
    // });
    formInit();

    console.log('Game initialized');
}


init();

let prevFillStyle = '';

function drawCanvas(skipOptimization = false) {
    const ctx = CANVAS.getContext('2d');

    if (!ctx) {
        console.error('Could not get canvas context');
        return;
    }

    const gridSizeWidth = GAME.width;
    const gridSizeHeight = GAME.height;
    const squareSizeWidth = Math.floor(CANVAS.width / gridSizeWidth);
    const squareSizeHeight = Math.floor(CANVAS.height / gridSizeHeight);

    let holes: { x: number, y: number }[] = [];
    let steamEngines: { x: number, y: number, type: CellAbstract }[] = [];
    let wires: { x: number, y: number, type: CellAbstract }[] = [];
    // const SKIP_DRAW_CELLS = ['hole', 'steam-engine-0', 'steam-engine-1', 'steam-engine-2', 'steam-engine-3', 'steam-engine-4', 'wire'];

    for (let y = 0; y < gridSizeHeight; y++) {
        for (let x = 0; x < gridSizeWidth; x++) {
            // let cell = GAME.nextGrid[y][x];
            // let genericCellType = getGenericCellType(cell);
            // if (
            //     !skipOptimization &&
            //     !SKIP_DRAW_CELLS.has(cell.cellType) &&
            //     GAME.grid[y][x].cellType === cell.cellType &&
            //     ADD_CELL_MAP.get(`${x},${y}`) === undefined
            // ) {
            //     continue;
            // }

            let cell = GAME.grid[y][x];

            let fillStyle: string | null = null;
            switch (cell.cellType) {
                case CellType.EMPTY:
                    fillStyle = BACKGROUND_COLOR;
                    break;
                case CellType.SAND:
                    fillStyle = '#c2b280';
                    break;
                case CellType.DIRT:
                    fillStyle = '#7a5230';
                    break;
                // case CellType.WET_DIRT:
                //     fillStyle = '#5a3d24';
                //     break;
                // case CellType.DIRT_WITH_SEED:
                //     fillStyle = '#2e5515ff';
                //     break;
                // case CellType.WET_DIRT_WITH_SEED:
                //     fillStyle = '#172e09ff';
                //     break;
                case CellType.WATER:
                    fillStyle = '#3399ff';
                    break;
                case CellType.STONE:
                    fillStyle = '#5c5c5cff';
                    break;
                case CellType.HOLE:
                    holes.push({ x, y });
                    break;
                case CellType.SAND_PORTAL:
                // case CellType.SAND_PORTAL_1:
                // case CellType.SAND_PORTAL_2:
                // case CellType.SAND_PORTAL_3:
                // case CellType.SAND_PORTAL_4:
                // case CellType.SAND_PORTAL_5:
                // case CellType.SAND_PORTAL_6:
                // case CellType.SAND_PORTAL_7:
                // case CellType.SAND_PORTAL_8:
                    fillStyle = '#b889b0ff';
                    break;
                case CellType.WATER_PORTAL:
                    fillStyle = '#6688ffff';
                    break;
                // case CellType.STEAM:
                //     fillStyle = '#d3d3d375';
                //     break;
                case CellType.FIRE:
                    if (cell instanceof Fire) {
                        switch (cell.phase) {
                            case 0:
                                fillStyle = '#990000'
                                break;
                            case 1:
                                fillStyle = '#cc0000'
                                break;
                            case 2:
                                fillStyle = '#ff0000';
                                break;
                            case 3:
                                fillStyle = '#ff3300'
                                break;
                            case 4:
                                fillStyle = '#ff6600'
                                break;
                        }
                    }
                    break;
                // case CellType.TORCH:
                //     fillStyle = '#3d1401'
                //     break;
                // case CellType.STEAM_ENGINE_0:
                // case CellType.STEAM_ENGINE_1:
                // case CellType.STEAM_ENGINE_2:
                // case CellType.STEAM_ENGINE_3:
                // case CellType.STEAM_ENGINE_4:
                //     steamEngines.push({ x, y, type: cell });
                //     break;
                // case CellType.WIRE:
                // case CellType.WIRE_P_L:
                // case CellType.WIRE_P_R:
                // case CellType.WIRE_P_U:
                // case CellType.WIRE_P_D:
                //     wires.push({ x, y, type: cell });
                //     break;
                // case CellType.EMPTY:
                //     fillStyle = null;
                //     break;
                // case CellType.SEED:
                //     fillStyle = '#bb6400ff';
                //     break;
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
                // case 'water-vapor-0':
                //     fillStyle = '#7ee1ff93';
                //     break;
                // case 'water-vapor-1':
                //     fillStyle = '#9fe4ff93';
                //     break;
                // case 'water-vapor-2':
                //     fillStyle = '#c0e7ff93';
                //     break;
                // case 'water-vapor-3':
                //     fillStyle = '#e1f0ff93';
                //     break;
                // case 'water-vapor-4':
                //     fillStyle = '#ffffff93';
                //     break;
                // case 'trunk':
                //     let trunkColor = cell.split('-')[3];
                //     fillStyle = trunkColor;
                //     break;
                // case 'seaweed':
                //     let heightIndex = +cell.split('-')[1];
                //     let tickCount = +cell.split('-')[2];
                //     let green = 140;
                //     let greenOffsetComparorator = (GAME._tickCount + tickCount + (heightIndex * 10)) % 40;
                //     if (greenOffsetComparorator % 40 < 10) {
                //         green += 8;
                //     } else if (greenOffsetComparorator % 40 < 20) {
                //         green += 16;
                //     } else if (greenOffsetComparorator % 40 < 30) {
                //         green += 24;
                //     } else if (greenOffsetComparorator % 40 < 40) {
                //         green += 16;
                //     }

                //     let greenHex = green.toString(16).padStart(2, '0');
                //     let color = `#00${greenHex}00`;
                //     fillStyle = color;
                //     break;
                // case 'fish':
                //     fillStyle = '#ff9900ff';
                //     break;
                default:
                    console.log('unknown cell type in drawCanvas:', cell);
                    fillStyle = 'rgba(255, 0, 212, 1)';
            }

            if (SKIP_DRAW_CELLS.has(cell.cellType)) {
                console.log('skipping draw')
                continue;
            }

            if (fillStyle == null) {
                console.error('null fill style for cell:', cell);
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

    // for (let engine of steamEngines) {
    //     // draw background shadow
    //     ctx.fillStyle = '#aaaa00ff';
    //     const px = Math.floor(engine.x * squareSizeWidth);
    //     const py = Math.floor(engine.y * squareSizeHeight);
    //     ctx.fillRect(px - 1, py - 1, squareSizeWidth + 2, squareSizeHeight + 2);
    // }

    // for (let engine of steamEngines) {
    //     let fillStyle: string;
    //     switch (engine.type) {
    //         case 'steam-engine-0':
    //             fillStyle = '#252525';
    //             break;
    //         case 'steam-engine-1':
    //             fillStyle = '#4C2E1F';
    //             break;
    //         case 'steam-engine-2':
    //             fillStyle = '#734719';
    //             break;
    //         case 'steam-engine-3':
    //             fillStyle = '#9A6013';
    //             break;
    //         case 'steam-engine-4':
    //             fillStyle = '#B9450B';
    //             break;
    //     }
    //     ctx.fillStyle = fillStyle;
    //     const px = Math.floor(engine.x * squareSizeWidth);
    //     const py = Math.floor(engine.y * squareSizeHeight);
    //     ctx.fillRect(px, py, squareSizeWidth, squareSizeHeight);
    // }

    // for (let wire of wires) {
    //     // draw background shadow
    //     ctx.fillStyle = '#ffffffff';
    //     const px = Math.floor(wire.x * squareSizeWidth);
    //     const py = Math.floor(wire.y * squareSizeHeight);
    //     ctx.fillRect(px - 1, py - 1, squareSizeWidth + 2, squareSizeHeight + 2);
    // }

    // for (let wire of wires) {
    //     let fillStyle = '#ffff00ff';
    //     if (wire.type == 'wire') {
    //         fillStyle = '#0f0427ff';
    //     }
    //     ctx.fillStyle = fillStyle;
    //     const px = Math.floor(wire.x * squareSizeWidth);
    //     const py = Math.floor(wire.y * squareSizeHeight);
    //     ctx.fillRect(px, py, squareSizeWidth, squareSizeHeight);
    // }

}

function update() {
    if (GAME._abortUpdate) {
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
    GAME._tickCount++;
    // console.log(`Tick ${GAME._tickCount} complete. FPS: ${fpsCurrent.toFixed(2)}`);
}


function addCellMapCells() {
    ADD_CELL_MAP.forEach((value, key) => {
        try {
            GAME.grid[value.y][value.x] = value.cell;
            // GAME.nextGrid[value.y][value.x] = value.cell;
        } catch (e) {
            console.error('Error adding cell at', value, 'with key', key);
        }

    });
}

export function getCellAtPos(x: number, y: number): CellAbstract | null {
    if (x < 0 || x >= GAME.width || y < 0 || y >= GAME.height) {
        return null;
    }
    if (ADD_CELL_MAP.has(`${x},${y}`)) {
        let cellOb = ADD_CELL_MAP.get(`${x},${y}`);
        if (cellOb) {
            return cellOb.cell;
        }
    }
    return GAME.grid[y][x];
}

function runCellularAutomata() {
    let cellsToProcess: AutomataCell[] = [];
    for (let y = GAME.height - 1; y >= 0; y--) {
        for (let x = 0; x < GAME.width; x++) {
            const cell = GAME.grid[y][x];
            if (cell instanceof AutomataCell) {
                cellsToProcess.push(cell);
            }
        }
    }

    // shuffle cellsToProcess to randomize processing order
    for (let i = cellsToProcess.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cellsToProcess[i], cellsToProcess[j]] = [cellsToProcess[j], cellsToProcess[i]];
    }

    for (let cell of cellsToProcess) {
        try {
            cell.automata();
        } catch (e) {
            console.error('Error running automata for cell at', cell.x, cell.y, 'with type', cell.cellType);
            console.error(e);
            console.log(cell);
            GAME._abortUpdate = true;
        }
        // let genericType = getGenericCellType(cell.type);
        // switch (genericType) {
        //     case 'sand':
        //         sandAutomata(cell.x, cell.y, cell.type);
        //         break;
        //     case 'wet-dirt-with-seed':
        //         wetDirtWithSeedAutomata(cell.x, cell.y, cell.type);
        //     case 'dirt':
        //     case 'wet-dirt':
        //     case 'dirt-with-seed':
        //         dirtAutomata(cell.x, cell.y, cell.type);
        //         break;
        //     case 'water':
        //     case 'water-left':
        //     case 'water-right':
        //         waterAutomata(cell.x, cell.y, cell.type);
        //         break;
        //     case 'sand-portal-1':
        //     case 'sand-portal-2':
        //     case 'sand-portal-3':
        //     case 'sand-portal-4':
        //     case 'sand-portal-5':
        //     case 'sand-portal-6':
        //     case 'sand-portal-7':
        //     case 'sand-portal-8':
        //     case 'water-portal':
        //         portalAutomata(cell.x, cell.y, cell.type);
        //         break;
        //     case 'fire-0':
        //     case 'fire-1':
        //     case 'fire-2':
        //     case 'fire-3':
        //     case 'fire-4':
        //         fireAutomata(cell.x, cell.y, cell.type);
        //         break;
        //     case 'steam':
        //     case 'water-vapor-0':
        //     case 'water-vapor-1':
        //     case 'water-vapor-2':
        //     case 'water-vapor-3':
        //     case 'water-vapor-4':
        //         gasAutomata(cell.x, cell.y, cell.type);
        //         break;
        //     case 'torch':
        //         portalAutomataUp(cell.x, cell.y, cell.type);
        //         break;
        //     case 'steam-engine-0':
        //     case 'steam-engine-1':
        //     case 'steam-engine-2':
        //     case 'steam-engine-3':
        //     case 'steam-engine-4':
        //         steamEngineAutomata(cell.x, cell.y, cell.type);
        //         break;
        //     case 'wire-p-l':
        //     case 'wire-p-r':
        //     case 'wire-p-u':
        //     case 'wire-p-d':
        //         wireAutomata(cell.x, cell.y, cell.type);
        //         break;
        //     case 'seed':
        //         seedAutomata(cell.x, cell.y, cell.type);
        //         break;
        //     case 'trunk':
        //         trunkAutomata(cell.x, cell.y, cell.type);
        //         break;
        //     case 'seaweed':
        //         seaweedAutomata(cell.x, cell.y, cell.type);
        //         break;
        //     case 'fish':
        //         fishAutomata(cell.x, cell.y, cell.type);
        //         break;
        // }
    }


    // bouyancy pass
    // for (let y = GAME.height - 1; y >= 0; y--) {
    //     for (let x = 0; x < GAME.width; x++) {
    //         const cell = GAME.nextGrid[y][x];
    //         switch (cell) {
    //             case 'sand':
    //             case 'dirt':
    //             case 'wet-dirt':
    //             case 'seed':
    //                 waterAutomataBuoyancy(x, y, cell);
    //                 break;
    //         }
    //     }
    // }

}

function updateGameStateGrid() {
    // copy nextGrid to grid and reset nextGrid
    for (let y = 0; y < GAME.height; y++) {
        // for (let x = 0; x < GAME.width; x++) {
        //     let ngCell = GAME.nextGrid[y][x];
        //     let gCell = GAME.grid[y][x];
        //     ngCell.x = x;
        //     ngCell.y = y;
        //     GAME.grid[y][x] = ngCell;
        // }
    }

}

let sandThisSecond = 0;
export let sandLastSecond = 0;
let lastSandCountUpdateTime = Date.now();

export function updateSandCount(amt=1) {
    let multAmt = amt;
    if (amt > 0) {
        multAmt = amt * (GAME.sandMultiplier || 1);
        sandThisSecond += multAmt;
    }
    GAME.sandCount += multAmt;

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
    // GAME.grid = Array.from({ length: GAME.height }, () =>
    //     Array.from({ length: GAME.width }, () => new Empty(0, 0)
    // ));
    // GAME.nextGrid = Array.from({ length: GAME.height }, () =>
    //     Array.from({ length: GAME.width }, () => new Empty(0, 0)
    // ));
    for (let y = 0; y < GAME.height; y++) {
        GAME.grid[y] = Array.from({ length: GAME.width }, (_, x) => new Empty(x, y));
        // GAME.nextGrid[y] = Array.from({ length: GAME.width }, (_, x) => new Empty(x, y));
    }
    drawCanvas(true);
    checkButtonsDisabled();
}

export function increaseGridSize() {
    let amtWidth = (GAME.timesIncreasedGrid + 1) * 10;
    let amtHeight = Math.floor(amtWidth / (40 / 30));
    GAME.timesIncreasedGrid += 1;
    for (let y = 0; y < GAME.height; y++) {
        for (let x = 0; x < amtWidth; x++) {
            GAME.grid[y].push(new Empty(x + GAME.width, y));
            // GAME.nextGrid[y].push(new Empty(x + GAME.width, y));
        }
    }

    for (let y = 0; y < amtHeight; y++) {
        GAME.grid.push(Array.from({ length: GAME.width + amtWidth }, (_, x) => new Empty(x, y + GAME.height)));
        // GAME.nextGrid.push(Array.from({ length: GAME.width + amtWidth }, (_, x) => new Empty(x, y + GAME.height)));
    }

    GAME.width = GAME.width + amtWidth;
    GAME.height = GAME.height + amtHeight;
    let ctx = CANVAS.getContext('2d');
    if (ctx == null) {
        console.error('Could not get canvas context');
        return;
    }
    ctx.clearRect(0, 0, CANVAS.width, CANVAS.height);
    drawCanvas(true);
}

export function setGridSize(width: number, height: number) {
    GAME.width = width;
    GAME.height = height;
    let grid = GAME.grid;
    // let nextGrid = GAME.nextGrid;

    if (grid.length > height) {
        grid.length = height;
        // nextGrid.length = height;
    }

    for (let y = 0; y < GAME.height; y++) {
        if (grid.length < height) {
            grid.push(Array.from({ length: GAME.width }, (_, x) => new Empty(x, y)));
            // nextGrid.push(Array.from({ length: GAME.width }, (_, x) => new Empty(x, y)));
        }
        for (let x = 0; x < GAME.width; x++) {
            if (grid[y].length < width) {
                grid[y].push(new Empty(x, y));
                // nextGrid[y].push(new Empty(x, y));
            }
        }
    }

    let ctx = CANVAS.getContext('2d');
    if (ctx == null) {
        console.error('Could not get canvas context');
        return;
    }
    ctx.clearRect(0, 0, CANVAS.width, CANVAS.height);
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
    GAME.holdToSandUnlocked = true;
}

export function saveGame() {
    console.log('Game saved.');
    localStorage.setItem('idle-sand-save', JSON.stringify(GAME));
}

function loadGame() {
    const save = localStorage.getItem('idle-sand-save');
    if (save) {
        const loadedState = JSON.parse(save) as GameState;
        Object.assign(GAME, loadedState);
        for (let y = 0; y < GAME.height; y++) {
            for (let x = 0; x < GAME.width; x++) {
                if (!GAME.grid[y][x]) {
                    GAME.grid[y][x] = new Empty(x, y);
                }
                // if (GAME.grid[y][x].cellType !== CellType.EMPTY) {
                //     console.log('before loading cell:', GAME.grid[y][x])
                //     console.log('cell type:', GAME.grid[y][x].cellType)
                // }
                GAME.grid[y][x] = getAbstractCell(GAME.grid[y][x].cellType, x, y);
            }
        }
        checkButtonsDisabled();
        console.log('Game loaded.');
    }
}


// function getGenericCellType(cellType: Cell): string {
//     if (cellType.startsWith('wet-dirt-with-seed-')) {
//         return 'wet-dirt-with-seed';
//     }
//     if (cellType.startsWith('trunk-')) {
//         return 'trunk';
//     }
//     if (cellType.startsWith('seaweed-')) {
//         return 'seaweed';
//     }
//     if (cellType.startsWith('fish-')) {
//         return 'fish';
//     }
//     return cellType;
// }

