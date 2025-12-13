import { GAME_STATE, updateSandCount } from "..";
import { Cell } from "../interfaces/cell.type";

const FALL_CELLS = ['empty', 'hole'];
const WATER_CELLS = ['water', 'water-left', 'water-right'];
const STEAM_ENGINE_CELLS = ['steam-engine-0', 'steam-engine-1', 'steam-engine-2', 'steam-engine-3', 'steam-engine-4'];
const DRY_DIRT_CELLS = ['dirt', 'dirt-with-seed'];
const WET_DIRT_CELLS = ['wet-dirt', 'wet-dirt-with-seed'];
const WATER_VAPOR_CELLS = ['water-vapor-0', 'water-vapor-1', 'water-vapor-2', 'water-vapor-3', 'water-vapor-4'];
const DIRT_CELLS = [...DRY_DIRT_CELLS, ...WET_DIRT_CELLS];
const PORTAL_SPAWN_MAP = new Map<string, number>();

export function sandAutomata(x: number, y: number, cellType: Cell) {

    if (y + 1 >= GAME_STATE.height) {
        GAME_STATE.nextGrid[y][x] = cellType;
        return;
    }; // at bottom edge

    let leftCell = GAME_STATE.nextGrid[y + 1][x - 1];
    let rightCell = GAME_STATE.nextGrid[y + 1][x + 1];

    const belowCell = GAME_STATE.nextGrid[y + 1][x];
    // const leftBelowCell = x - 1 >= 0 ? GAME_STATE.nextGrid[y + 1][x - 1] : null;
    // const rightBelowCell = x + 1 < GAME_STATE.width ? GAME_STATE.nextGrid[y + 1][x + 1] : null;

    if (FALL_CELLS.includes(belowCell)) {
        if (holeCheck({ x, y }, { x: x, y: y + 1 })) {
            return;
        }
        GAME_STATE.nextGrid[y + 1][x] = cellType;
        GAME_STATE.nextGrid[y][x] = belowCell;
        return;
    }

    const leftEmpty = x - 1 >= 0 && FALL_CELLS.includes(leftCell);
    const rightEmpty = x + 1 < GAME_STATE.width && FALL_CELLS.includes(rightCell);

    let moveX;
    let moveY = y + 1;
    let moveCell;

    if (leftEmpty && rightEmpty) {
        // randomly choose left or right

        if (Math.random() < 0.5) {
            moveCell = leftCell;
            moveX = x - 1;
        } else {
            moveCell = rightCell;
            moveX = x + 1;
        }

        if (holeCheck({ x, y }, { x: moveX, y: moveY })) {
            return;
        }
        GAME_STATE.nextGrid[moveY][moveX] = cellType;
        GAME_STATE.nextGrid[y][x] = moveCell;
        return;
    }

    if (leftEmpty) {
        // GAME_STATE.nextGrid[y + 1][x - 1] = 'sand';
        // GAME_STATE.nextGrid[y][x] = leftCell;
        moveX = x - 1;
        moveCell = leftCell;
    } else if (rightEmpty) {
        moveX = x + 1;
        moveCell = rightCell;
        // GAME_STATE.nextGrid[y + 1][x + 1] = 'sand';
        // GAME_STATE.nextGrid[y][x] = rightCell;
    } else {
        GAME_STATE.nextGrid[y][x] = cellType;
        return; // cannot move
    }

    if (holeCheck({ x, y }, { x: moveX, y: moveY })) {
        return;
    }
    GAME_STATE.nextGrid[moveY][moveX] = cellType;
    GAME_STATE.nextGrid[y][x] = moveCell;
}

export function dirtAutomata(x: number, y: number, cellType: Cell) {
    cellType = GAME_STATE.nextGrid[y][x];

    try {
        let belowCell = y + 1 < GAME_STATE.height ? GAME_STATE.nextGrid[y + 1][x] : null;
        let belowLeftCell = (x - 1 >= 0 && y + 1 < GAME_STATE.height) ? GAME_STATE.nextGrid[y + 1][x - 1] : null;
        let belowRightCell = (x + 1 < GAME_STATE.width && y + 1 < GAME_STATE.height) ? GAME_STATE.nextGrid[y + 1][x + 1] : null;
        let leftCell = x - 1 >= 0 ? GAME_STATE.nextGrid[y][x - 1] : null;
        let rightCell = x + 1 < GAME_STATE.width ? GAME_STATE.nextGrid[y][x + 1] : null;
        let topCell = y - 1 >= 0 ? GAME_STATE.nextGrid[y - 1][x] : null;
        let topLeftCell = (x - 1 >= 0 && y - 1 >= 0) ? GAME_STATE.nextGrid[y - 1][x - 1] : null;
        let topRightCell = (x + 1 < GAME_STATE.width && y - 1 >= 0) ? GAME_STATE.nextGrid[y - 1][x + 1] : null;

        let neightborWaterCells = [];
        let neightborWetDirtCells = [];
        let neightborDryDirtCells = [];
        let neighbotEmptyCells = [];

        if (WATER_CELLS.includes(belowCell)) {
            neightborWaterCells.push({ x: x, y: y + 1 });
        } else if (WET_DIRT_CELLS.includes(belowCell)) {
            neightborWetDirtCells.push({ x: x, y: y + 1, cellType: belowCell });
        } else if (DRY_DIRT_CELLS.includes(belowCell)) {
            neightborDryDirtCells.push({ x: x, y: y + 1, cellType: belowCell });
        } else if (belowCell === 'empty') {
            neighbotEmptyCells.push({ x: x, y: y + 1 });
        }
        if (WATER_CELLS.includes(leftCell)) {
            neightborWaterCells.push({ x: x - 1, y: y });
        } else if (WET_DIRT_CELLS.includes(leftCell)) {
            neightborWetDirtCells.push({ x: x - 1, y: y, cellType: leftCell });
        } else if (DRY_DIRT_CELLS.includes(leftCell)) {
            neightborDryDirtCells.push({ x: x - 1, y: y, cellType: leftCell });
        } else if (leftCell === 'empty') {
            neighbotEmptyCells.push({ x: x - 1, y: y });
        }
        if (WATER_CELLS.includes(rightCell)) {
            neightborWaterCells.push({ x: x + 1, y: y });
        } else if (WET_DIRT_CELLS.includes(rightCell)) {
            neightborWetDirtCells.push({ x: x + 1, y: y, cellType: rightCell });
        } else if (DRY_DIRT_CELLS.includes(rightCell)) {
            neightborDryDirtCells.push({ x: x + 1, y: y, cellType: rightCell });
        } else if (rightCell === 'empty') {
            neighbotEmptyCells.push({ x: x + 1, y: y });
        }
        if (WATER_CELLS.includes(topCell)) {
            neightborWaterCells.push({ x: x, y: y - 1 });
        } else if (WET_DIRT_CELLS.includes(topCell)) {
            neightborWetDirtCells.push({ x: x, y: y - 1, cellType: topCell });
        } else if (DRY_DIRT_CELLS.includes(topCell)) {
            neightborDryDirtCells.push({ x: x, y: y - 1, cellType: topCell });
        } else if (topCell === 'empty') {
            neighbotEmptyCells.push({ x: x, y: y - 1 });
        }
        if (WATER_CELLS.includes(belowLeftCell)) {
            neightborWaterCells.push({ x: x - 1, y: y + 1 });
        } else if (WET_DIRT_CELLS.includes(belowLeftCell)) {
            neightborWetDirtCells.push({ x: x - 1, y: y + 1, cellType: belowLeftCell });
        } else if (DRY_DIRT_CELLS.includes(belowLeftCell)) {
            neightborDryDirtCells.push({ x: x - 1, y: y + 1, cellType: belowLeftCell });
        } else if (belowLeftCell === 'empty') {
            neighbotEmptyCells.push({ x: x - 1, y: y + 1 });
        }
        if (WATER_CELLS.includes(belowRightCell)) {
            neightborWaterCells.push({ x: x + 1, y: y + 1 });
        } else if (WET_DIRT_CELLS.includes(belowRightCell)) {
            neightborWetDirtCells.push({ x: x + 1, y: y + 1, cellType: belowRightCell });
        } else if (DRY_DIRT_CELLS.includes(belowRightCell)) {
            neightborDryDirtCells.push({ x: x + 1, y: y + 1, cellType: belowRightCell });
        } else if (belowRightCell === 'empty') {
            neighbotEmptyCells.push({ x: x + 1, y: y + 1 });
        }
        if (WATER_CELLS.includes(topLeftCell)) {
            neightborWaterCells.push({ x: x - 1, y: y - 1 });
        } else if (WET_DIRT_CELLS.includes(topLeftCell)) {
            neightborWetDirtCells.push({ x: x - 1, y: y - 1, cellType: topLeftCell });
        } else if (DRY_DIRT_CELLS.includes(topLeftCell)) {
            neightborDryDirtCells.push({ x: x - 1, y: y - 1, cellType: topLeftCell });
        } else if (topLeftCell === 'empty') {
            neighbotEmptyCells.push({ x: x - 1, y: y - 1 });
        }
        if (WATER_CELLS.includes(topRightCell)) {
            neightborWaterCells.push({ x: x + 1, y: y - 1 });
        } else if (WET_DIRT_CELLS.includes(topRightCell)) {
            neightborWetDirtCells.push({ x: x + 1, y: y - 1, cellType: topRightCell });
        } else if (DRY_DIRT_CELLS.includes(topRightCell)) {
            neightborDryDirtCells.push({ x: x + 1, y: y - 1, cellType: topRightCell });
        } else if (topRightCell === 'empty') {
            neighbotEmptyCells.push({ x: x + 1, y: y - 1 });
        }


        if (DRY_DIRT_CELLS.includes(cellType)) {
            let waterTransferCells = [];
            if (neightborWaterCells.length > 0) {
                let choice = neightborWaterCells[Math.floor(Math.random() * neightborWaterCells.length)];
                GAME_STATE.nextGrid[choice.y][choice.x] = 'empty';
                cellType = (cellType === 'dirt' ? 'wet-dirt' : 'wet-dirt-with-seed');
                GAME_STATE.nextGrid[y][x] = cellType;
                return;
            }
        }


        
        if (WET_DIRT_CELLS.includes(cellType) && GAME_STATE._tickCount % 5 == 0) {

            let waterTransferCells = [];
            if (DRY_DIRT_CELLS.includes(belowCell)) {
                waterTransferCells.push({ x: x, y: y + 1, cellType: belowCell });
            }
            if (DRY_DIRT_CELLS.includes(belowLeftCell)) {
                waterTransferCells.push({ x: x - 1, y: y, cellType: belowLeftCell });
            }
            if (DRY_DIRT_CELLS.includes(belowRightCell)) {
                waterTransferCells.push({ x: x + 1, y: y + 1, cellType: belowRightCell });
            }
            if (waterTransferCells.length > 0) {
                const choice = waterTransferCells[Math.floor(Math.random() * waterTransferCells.length)];
                GAME_STATE.nextGrid[choice.y][choice.x] = (choice.cellType === 'dirt' ? 'wet-dirt' : 'wet-dirt-with-seed');
                cellType = (cellType === 'wet-dirt' ? 'dirt' : 'dirt-with-seed');
                GAME_STATE.nextGrid[y][x] = cellType;
            }
        }

        if (WET_DIRT_CELLS.includes(cellType) &&
            GAME_STATE._tickCount % 17 == 0
        ) {
            let chanceToDry = 0.005;
            if (Math.random() < chanceToDry) {
                if (neighbotEmptyCells.length > 0 || neightborDryDirtCells.length > 0) {
                    cellType = (cellType === 'wet-dirt' ? 'dirt' : 'dirt-with-seed');
                    GAME_STATE.nextGrid[y][x] = cellType;
                }
            }
        }       

        sandAutomata(x, y, cellType);
    } catch (e) {
        GAME_STATE._abortUpdate = true;
        console.error('Error in dirtAutomata at', x, y, e);
        console.log(GAME_STATE);
    }

}


export function waterAutomata(x: number, y: number, waterCellType: Cell) {
    if (y + 1 >= GAME_STATE.height) {
        GAME_STATE.nextGrid[y][x] = waterCellType;
        return;
    } // at bottom edge

    let belowCell = y + 1 < GAME_STATE.height ? GAME_STATE.nextGrid[y + 1][x] : null;
    let leftCell = x - 1 >= 0 ? GAME_STATE.nextGrid[y][x - 1] : null;
    let rightCell = x + 1 < GAME_STATE.width ? GAME_STATE.nextGrid[y][x + 1] : null;
    let bottomLeftCell = (x - 1 >= 0 && y + 1 < GAME_STATE.height) ? GAME_STATE.nextGrid[y + 1][x - 1] : null;
    let bottomRightCell = (x + 1 < GAME_STATE.width && y + 1 < GAME_STATE.height) ? GAME_STATE.nextGrid[y + 1][x + 1] : null;

    if (FALL_CELLS.includes(belowCell)) {
        if (holeCheck({ x, y }, { x: x, y: y + 1 })) {
            return;
        }
        GAME_STATE.nextGrid[y + 1][x] = waterCellType;
        GAME_STATE.nextGrid[y][x] = 'empty';
    } else {

        let moveX = x;
        let moveY = y;
        let moveCell = null;
        // try left and right
        let emptyCells = [];
        let foundDirected = null;

        if (FALL_CELLS.includes(bottomLeftCell)) {
            if (waterCellType === 'water-left') {
                foundDirected = 'bottom-left';
            }
            emptyCells.push('bottom-left');
        }
        if (FALL_CELLS.includes(bottomRightCell)) {
            if (waterCellType === 'water-right') {
                foundDirected = 'bottom-right';
            }
            emptyCells.push('bottom-right');
        }

        // prioritize bottom left/right over left/right
        if (emptyCells.length === 0) {
            if (FALL_CELLS.includes(leftCell)) {
                if (waterCellType === 'water-left') {
                    foundDirected = 'left';
                }
                emptyCells.push('left');
            }
            if (FALL_CELLS.includes(rightCell)) {
                if (waterCellType === 'water-right') {
                    foundDirected = 'right';
                }
                emptyCells.push('right');
            }
        }

        // no empty cells to move into
        if (emptyCells.length === 0) {
            GAME_STATE.nextGrid[y][x] = 'water';
            waterVaporCheck({ x, y });
            return; // cannot move
        }

        const choice = foundDirected ?? emptyCells[Math.floor(Math.random() * emptyCells.length)];
        switch (choice) {
            case 'left':
                moveX = x - 1;
                moveCell = leftCell;
                waterCellType = 'water-left';
                break;
            case 'right':
                moveX = x + 1;
                moveCell = rightCell;
                waterCellType = 'water-right';
                break;
            case 'bottom-left':
                moveX = x - 1;
                moveY = y + 1;
                moveCell = bottomLeftCell;
                waterCellType = 'water-left';
                break;
            case 'bottom-right':
                moveX = x + 1;
                moveY = y + 1;
                moveCell = bottomRightCell;
                waterCellType = 'water-right';
                break;
        }

        if (holeCheck({ x, y }, { x: moveX, y: moveY })) {
            return;
        }

        GAME_STATE.nextGrid[moveY][moveX] = waterCellType;
        GAME_STATE.nextGrid[y][x] = moveCell;
    }
}

function waterVaporCheck(myPos: { x: number, y: number }) {
    let chanceToVaporize = 0.0001;
    let aboveCell = myPos.y - 1 >= 0 ? GAME_STATE.nextGrid[myPos.y - 1][myPos.x] : null;

    if (Math.random() < chanceToVaporize && aboveCell === 'empty') {
        GAME_STATE.nextGrid[myPos.y][myPos.x] = 'water-vapor-0';
    }
}

export function holeCheck(myPos: { x: number, y: number }, targetPos: { x: number, y: number }) {

    let checkCell = GAME_STATE.nextGrid[targetPos.y][targetPos.x];

    if (checkCell === 'hole') {
        GAME_STATE.nextGrid[myPos.y][myPos.x] = 'empty';
        return true;
    }
    else {
        return false;
    }
}

export function waterAutomataBuoyancy(x: number, y: number, cellType: Cell) {
    const belowCell = y + 1 < GAME_STATE.height ? GAME_STATE.nextGrid[y + 1][x] : null;
    const leftBelowCell = (x - 1 >= 0 && y + 1 < GAME_STATE.height) ? GAME_STATE.nextGrid[y + 1][x - 1] : null;
    const rightBelowCell = (x + 1 < GAME_STATE.width && y + 1 < GAME_STATE.height) ? GAME_STATE.nextGrid[y + 1][x + 1] : null;

    const FALL_STRAIGHT_DOWN_CELLS = ['seed'];

    let waterBelowCells = [];
    if (WATER_CELLS.includes(belowCell)) {
        waterBelowCells.push('center');

        if (FALL_STRAIGHT_DOWN_CELLS.includes(cellType)) {
            GAME_STATE.nextGrid[y + 1][x] = cellType;
            GAME_STATE.nextGrid[y][x] = 'water';
            return;
        }
    }
    if (WATER_CELLS.includes(leftBelowCell)) {
        waterBelowCells.push('left');
    }
    if (WATER_CELLS.includes(rightBelowCell)) {
        waterBelowCells.push('right');
    }
    // if (y + 2 == GAME_STATE.height) {
    //     console.log('sand here', waterBelowCells);
    // }
    if (waterBelowCells.length > 0) {
        // randomly choose one of the water below cells to fall into
        const choice = waterBelowCells[Math.floor(Math.random() * waterBelowCells.length)];
        switch (choice) {
            case 'center':
                GAME_STATE.nextGrid[y + 1][x] = cellType
                GAME_STATE.nextGrid[y][x] = 'water';
                break;
            case 'left':
                GAME_STATE.nextGrid[y + 1][x - 1] = cellType;
                GAME_STATE.nextGrid[y][x] = 'water';
                break;
            case 'right':
                GAME_STATE.nextGrid[y + 1][x + 1] = cellType;
                GAME_STATE.nextGrid[y][x] = 'water';
                break;
        }
    } else {
    
    }
}

export function portalAutomata(x: number, y: number, cellType: Cell) {

    let lastSpawnTime = 0;
    let msPassed = Infinity;

    if (PORTAL_SPAWN_MAP.has(`${x},${y}`)) {
        lastSpawnTime = PORTAL_SPAWN_MAP.get(`${x},${y}`);
    }

    let now = Date.now();
    msPassed = now - lastSpawnTime;

    if (lastSpawnTime + (1000 / GAME_STATE.sandPortalRate) > now) {
        return;
    }

    PORTAL_SPAWN_MAP.set(`${x},${y}`, now);

    let belowCell = y + 1 < GAME_STATE.height ? GAME_STATE.nextGrid[y + 1][x] : null;
    let targetSpawn: Cell = null;
    switch (cellType) {
        case 'sand-portal-1':
        case 'sand-portal-2':
        case 'sand-portal-3':
        case 'sand-portal-4':
        case 'sand-portal-5':
        case 'sand-portal-6':
        case 'sand-portal-7':
        case 'sand-portal-8':
            let portalState = parseInt(cellType.split('-')[2]);
            GAME_STATE.nextGrid[y][x] = `sand-portal-${(portalState - 1)}` as Cell;
            targetSpawn = 'sand';
            break;
        case 'water-portal':
            targetSpawn = 'water';
            break;
    }
    if (FALL_CELLS.includes(belowCell)) {
        if (holeCheck({ x, y }, { x: x, y: y + 1 })) {
            return;
        }
        if (targetSpawn === 'sand') {
            updateSandCount();
        }
        GAME_STATE.nextGrid[y + 1][x] = targetSpawn;
    }
}

export function portalAutomataUp(x: number, y: number, cellType: Cell) {

    let lastSpawnTime = 0;
    let msPassed = Infinity;
    if (PORTAL_SPAWN_MAP.has(`${x},${y}`)) {
        lastSpawnTime = PORTAL_SPAWN_MAP.get(`${x},${y}`);
    }

    let now = Date.now();
    msPassed = now - lastSpawnTime;

    if (lastSpawnTime + (1000 / GAME_STATE.sandPortalRate) > now) {
        return;
    }

    PORTAL_SPAWN_MAP.set(`${x},${y}`, now);

    let aboveCell = y - 1 >= 0 ? GAME_STATE.nextGrid[y - 1][x] : null;
    let aboveLeftCell = (x - 1 >= 0 && y - 1 >= 0) ? GAME_STATE.nextGrid[y - 1][x - 1] : null;
    let aboveRightCell = (x + 1 < GAME_STATE.width && y - 1 >= 0) ? GAME_STATE.nextGrid[y - 1][x + 1] : null;

    let targetSpawn: Cell = null;

    switch (cellType) {
        case 'torch':
            targetSpawn = 'fire-0';
            break;
    }

    let aboveCells = [];

    if (FALL_CELLS.includes(aboveCell)) {
        aboveCells.push('center');
    }
    if (FALL_CELLS.includes(aboveLeftCell)) {
        aboveCells.push('left');
    }
    if (FALL_CELLS.includes(aboveRightCell)) {
        aboveCells.push('right');
    }

    if (aboveCells.length === 0) {
        return;
    }

    let targetX = x;
    let targetY = y - 1;
    let targetCell = aboveCell;

    const choice = aboveCells[Math.floor(Math.random() * aboveCells.length)];
    switch (choice) {
        case 'center':
            targetX = x;
            targetY = y - 1;
            targetCell = aboveCell;
            break;
        case 'left':
            targetX = x - 1;
            targetY = y - 1;
            targetCell = aboveLeftCell;
            break;
        case 'right':
            targetX = x + 1;
            targetY = y - 1;
            targetCell = aboveRightCell;
            break;
    }

    if (holeCheck({ x, y }, { x: targetX, y: targetY })) {
        return;
    }

    GAME_STATE.nextGrid[targetY][targetX] = targetSpawn;
}

export function fireAutomata(x: number, y: number, cellType: Cell) {

    let fireState = parseInt(cellType.split('-')[1]);
    if (fireState > 3) {
        GAME_STATE.nextGrid[y][x] = 'empty';
        return;
    }

    const FIRE_INTERACT_CELLS = [...FALL_CELLS, ...WATER_CELLS];

    let aboveCell = y - 1 >= 0 ? GAME_STATE.nextGrid[y - 1][x] : null;
    let leftCell = x - 1 >= 0 ? GAME_STATE.nextGrid[y][x - 1] : null;
    let rightCell = x + 1 < GAME_STATE.width ? GAME_STATE.nextGrid[y][x + 1] : null;
    let leftUpperCell = (x - 1 >= 0 && y - 1 >= 0) ? GAME_STATE.nextGrid[y - 1][x - 1] : null;
    let rightUpperCell = (x + 1 < GAME_STATE.width && y - 1 >= 0) ? GAME_STATE.nextGrid[y - 1][x + 1] : null;

    let fireAboveCells = [];
    if (FIRE_INTERACT_CELLS.includes(aboveCell)) {
        fireAboveCells.push('center');
    }
    if (FIRE_INTERACT_CELLS.includes(leftUpperCell)) {
        fireAboveCells.push('left-upper');
    }
    if (FIRE_INTERACT_CELLS.includes(rightUpperCell)) {
        fireAboveCells.push('right-upper');
    }

    let moveX = x;
    let moveY = y;
    let moveCell = null;
    if (fireAboveCells.length > 0) {
        // randomly choose one of the fire above cells to burn into
        const choice = fireAboveCells[Math.floor(Math.random() * fireAboveCells.length)];
        // prioritize center, left-upper, right-upper
        switch (choice) {
            case 'center':
                moveY = y - 1;
                moveCell = aboveCell;
                break;
            case 'left-upper':
                moveX = x - 1;
                moveY = y - 1;
                moveCell = leftUpperCell;
                break;
            case 'right-upper':
                moveX = x + 1;
                moveY = y - 1;
                moveCell = rightUpperCell;
                break;
        } 
    } else {
        if (FIRE_INTERACT_CELLS.includes(leftCell)) {
            fireAboveCells.push('left');
        }
        if (FIRE_INTERACT_CELLS.includes(rightCell)) {
            fireAboveCells.push('right');
        }
        if (fireAboveCells.length === 0) {
            // cannot move
            // progress fire state
            return;
        }
        const choice = fireAboveCells[Math.floor(Math.random() * fireAboveCells.length)];
        switch (choice) {
            case 'left':
                moveX = x - 1;
                moveCell = leftCell;
                break;
            case 'right':
                moveX = x + 1;
                moveCell = rightCell;
                break;
        }
    }


    if (holeCheck({ x, y }, { x: moveX, y: moveY })) {
        return;
    }

    fireInteraction({ x, y }, { x: moveX, y: moveY }, fireState + 1);
}

function fireInteraction(pos: { x: number, y: number }, targetPos: { x: number, y: number }, fireState: number) {
    let targetCell = GAME_STATE.nextGrid[targetPos.y][targetPos.x];

    if (FALL_CELLS.includes(targetCell)) {
        GAME_STATE.nextGrid[targetPos.y][targetPos.x] = `fire-${fireState}` as Cell;
        GAME_STATE.nextGrid[pos.y][pos.x] = targetCell;
    }

    if (WATER_CELLS.includes(targetCell)) {
        GAME_STATE.nextGrid[targetPos.y][targetPos.x] = 'steam';
        GAME_STATE.nextGrid[pos.y][pos.x] = 'empty';
    }
}

export function gasAutomata(x: number, y: number, cellType: Cell) {
    // if (y - 1 < 0) {
    //     GAME_STATE.nextGrid[y][x] = cellType;
    //     return;
    // }; // at top edge

    if (WATER_VAPOR_CELLS.includes(cellType) && GAME_STATE._tickCount % 5 !== 0) {
        return;
    }

    const STEAM_INTERACTION_CELLS = [...FALL_CELLS, ...STEAM_ENGINE_CELLS];
    const VAPOR_INTERACTION_CELLS = [...FALL_CELLS, ...WATER_VAPOR_CELLS.filter(c => c !== 'water-vapor-4')];

    let aboveCell = y - 1 >= 0 ? GAME_STATE.nextGrid[y - 1][x] : null;
    let leftCell = x - 1 >= 0 ? GAME_STATE.nextGrid[y][x - 1] : null;
    let rightCell = x + 1 < GAME_STATE.width ? GAME_STATE.nextGrid[y][x + 1] : null;
    let leftUpperCell = (x - 1 >= 0 && y - 1 >= 0) ? GAME_STATE.nextGrid[y - 1][x - 1] : null;
    let rightUpperCell = (x + 1 < GAME_STATE.width && y - 1 >= 0) ? GAME_STATE.nextGrid[y - 1][x + 1] : null;

    let fallAboveCells = [];
    if (
        (STEAM_INTERACTION_CELLS.includes(aboveCell) && cellType === 'steam') ||
        (VAPOR_INTERACTION_CELLS.includes(aboveCell) && cellType.startsWith('water-vapor'))
    ) {
        fallAboveCells.push('center');
    }
    if (
        (STEAM_INTERACTION_CELLS.includes(leftUpperCell) && cellType === 'steam') ||
        (VAPOR_INTERACTION_CELLS.includes(leftUpperCell) && cellType.startsWith('water-vapor'))
    ) {
        fallAboveCells.push('left-upper');
    }
    if (
        (STEAM_INTERACTION_CELLS.includes(rightUpperCell) && cellType === 'steam') ||
        (VAPOR_INTERACTION_CELLS.includes(rightUpperCell) && cellType.startsWith('water-vapor'))
    ) {
        fallAboveCells.push('right-upper');
    }

    let moveX = x;
    let moveY = y;
    let moveCell = null;
    if (fallAboveCells.length > 0) {
        // randomly choose one of the fire above cells to burn into
        const choice = fallAboveCells[Math.floor(Math.random() * fallAboveCells.length)];
        // prioritize center, left-upper, right-upper
        switch (choice) {
            case 'center':
                moveY = y - 1;
                moveCell = aboveCell;
                break;
            case 'left-upper':
                moveX = x - 1;
                moveY = y - 1;
                moveCell = leftUpperCell;
                break;
            case 'right-upper':
                moveX = x + 1;
                moveY = y - 1;
                moveCell = rightUpperCell;
                break;
        } 
    } else {
        if (STEAM_INTERACTION_CELLS.includes(leftCell)) {
            fallAboveCells.push('left');
        }
        if (STEAM_INTERACTION_CELLS.includes(rightCell)) {
            fallAboveCells.push('right');
        }
        if (fallAboveCells.length === 0) {
            // cannot move
            return;
        }
        const choice = fallAboveCells[Math.floor(Math.random() * fallAboveCells.length)];
        switch (choice) {
            case 'left':
                moveX = x - 1;
                moveCell = leftCell;
                break;
            case 'right':
                moveX = x + 1;
                moveCell = rightCell;
                break;
        }
    }


    if (holeCheck({ x, y }, { x: moveX, y: moveY })) {
        return;
    }

    switch (cellType) {
        case 'steam':
            steamInteraction({ x, y }, { x: moveX, y: moveY });
            break;
        case 'water-vapor-0':
        case 'water-vapor-1':
        case 'water-vapor-2':
        case 'water-vapor-3':
        case 'water-vapor-4':
            vaporInteraction({ x, y }, { x: moveX, y: moveY });
            break;
    }
}

function steamInteraction(pos: { x: number, y: number }, targetPos: { x: number, y: number }) {
    let targetCell = GAME_STATE.nextGrid[targetPos.y][targetPos.x];
    if (FALL_CELLS.includes(targetCell)) {
        GAME_STATE.nextGrid[targetPos.y][targetPos.x] = 'steam';
        GAME_STATE.nextGrid[pos.y][pos.x] = targetCell;
        return;
    }

    if (STEAM_ENGINE_CELLS.includes(targetCell)) {
        let engineState = parseInt(targetCell.split('-')[2]);
        let newEngineState = Math.min(engineState + 1, 4);
        GAME_STATE.nextGrid[targetPos.y][targetPos.x] = `steam-engine-${newEngineState}` as Cell;
        GAME_STATE.nextGrid[pos.y][pos.x] = 'empty';
    }
}

function vaporInteraction(pos: { x: number, y: number }, targetPos: { x: number, y: number }) {
    let vaporState = parseInt(GAME_STATE.nextGrid[pos.y][pos.x].split('-')[2]);
    let cellType = GAME_STATE.nextGrid[pos.y][pos.x];
    let targetCell = GAME_STATE.nextGrid[targetPos.y][targetPos.x];

    if (cellType === 'water-vapor-4') {
        GAME_STATE.nextGrid[pos.y][pos.x] = 'empty';
        GAME_STATE.nextGrid[pos.y][pos.x] = 'water';
        return;
    }

    const VAPOR_FALL_CELLS = [...(WATER_VAPOR_CELLS.filter(c => c !== 'water-vapor-4'))];

    if (FALL_CELLS.includes(targetCell)) {
        GAME_STATE.nextGrid[targetPos.y][targetPos.x] = cellType as Cell;
        GAME_STATE.nextGrid[pos.y][pos.x] = targetCell;
        return;
    }

    if (VAPOR_FALL_CELLS.includes(targetCell)) {
        let targetState = parseInt(targetCell.split('-')[2]);
        GAME_STATE.nextGrid[targetPos.y][targetPos.x] = `water-vapor-${Math.min((targetState) + (vaporState + 1), 4)}` as Cell;
        console.log('combine vapor', targetState, vaporState);
        GAME_STATE.nextGrid[pos.y][pos.x] = 'empty' as Cell;
    }
}

export function steamEngineAutomata(x: number, y: number, cellType: Cell) {
    let engineState = parseInt(cellType.split('-')[2]);
    let leftNeighbor = x - 1 >= 0 ? GAME_STATE.nextGrid[y][x - 1] : null;
    let rightNeighbor = x + 1 < GAME_STATE.width ? GAME_STATE.nextGrid[y][x + 1] : null;
    let aboveNeighbor = y - 1 >= 0 ? GAME_STATE.nextGrid[y - 1][x] : null;
    let belowNeighbor = y + 1 < GAME_STATE.height ? GAME_STATE.nextGrid[y + 1][x] : null;

    let canPassPowerCells = [];
    let wirePassCells = [];

    if (engineState < 3) {
        // random shutdown chance
        let pass = Math.random() > 0.01 ? true : false;
        if (!pass) {
            GAME_STATE.nextGrid[y][x] = `steam-engine-0` as Cell;
        }
    }

    if (engineState === 4) {
        // wire check
        if (leftNeighbor === 'wire') {
            wirePassCells.push('left');
        }
        if (rightNeighbor === 'wire') {
            wirePassCells.push('right');
        }
        if (aboveNeighbor === 'wire') {
            wirePassCells.push('above');
        }
        if (belowNeighbor === 'wire') {
            wirePassCells.push('below');
        }

        if (wirePassCells.length > 0) {
            const targetCell = wirePassCells[Math.floor(Math.random() * wirePassCells.length)];
            switch (targetCell) {
                case 'left':
                    GAME_STATE.nextGrid[y][x - 1] = `wire-p-r` as Cell;
                    break;
                case 'right':
                    GAME_STATE.nextGrid[y][x + 1] = `wire-p-l` as Cell;
                    break;
                case 'above':
                    GAME_STATE.nextGrid[y - 1][x] = `wire-p-d` as Cell;
                    break;
                case 'below':
                    GAME_STATE.nextGrid[y + 1][x] = `wire-p-u` as Cell;
                    break;
            }
            GAME_STATE.nextGrid[y][x] = `steam-engine-0` as Cell;
            return;
        }
    }


    if (STEAM_ENGINE_CELLS.includes(leftNeighbor)) {
        let neighborState = parseInt(leftNeighbor.split('-')[2]);
        if (neighborState < engineState) {
            canPassPowerCells.push('left');
        }
    }
    if (STEAM_ENGINE_CELLS.includes(rightNeighbor)) {
        let neighborState = parseInt(rightNeighbor.split('-')[2]);
        if (neighborState < engineState) {
            canPassPowerCells.push('right');
        }
    }
    if (STEAM_ENGINE_CELLS.includes(aboveNeighbor)) {
        let neighborState = parseInt(aboveNeighbor.split('-')[2]);
        if (neighborState < engineState) {
            canPassPowerCells.push('above');
        }
    }
    if (STEAM_ENGINE_CELLS.includes(belowNeighbor)) {
        let neighborState = parseInt(belowNeighbor.split('-')[2]);
        if (neighborState < engineState) {
            canPassPowerCells.push('below');
        }
    }

    if (canPassPowerCells.length == 0) {
        return;
    }

    const targetCell = canPassPowerCells[Math.floor(Math.random() * canPassPowerCells.length)];

    let lostEnergy = Math.random() > 0.03 ? 1 : 2;
    let neighborState;
    switch (targetCell) {
        case 'left':
            neighborState = parseInt(leftNeighbor.split('-')[2]);
            GAME_STATE.nextGrid[y][x - 1] = `steam-engine-${Math.min(neighborState + 1, 4)}` as Cell;
            break;
        case 'right':
            neighborState = parseInt(rightNeighbor.split('-')[2]);
            GAME_STATE.nextGrid[y][x + 1] = `steam-engine-${Math.min(neighborState + 1, 4)}` as Cell;
            break;
        case 'above':
            neighborState = parseInt(aboveNeighbor.split('-')[2]);
            GAME_STATE.nextGrid[y - 1][x] = `steam-engine-${Math.min(neighborState + 1, 4)}` as Cell;
            break;
        case 'below':
            neighborState = parseInt(belowNeighbor.split('-')[2]);
            GAME_STATE.nextGrid[y + 1][x] = `steam-engine-${Math.min(neighborState + 1, 4)}` as Cell;
            break;
    }

    GAME_STATE.nextGrid[y][x] = `steam-engine-${Math.max(engineState - lostEnergy, 0)}` as Cell;
}

export function wireAutomata(x: number, y: number, cellType: Cell) {
    let cellAtPos = GAME_STATE.nextGrid[y][x];
    let cellAtRight = x + 1 < GAME_STATE.width ? GAME_STATE.nextGrid[y][x + 1] : null;
    let cellAtLeft = x - 1 >= 0 ? GAME_STATE.nextGrid[y][x - 1] : null;
    let cellAtBelow = y + 1 < GAME_STATE.height ? GAME_STATE.nextGrid[y + 1][x] : null;
    let cellAtAbove = y - 1 >= 0 ? GAME_STATE.nextGrid[y - 1][x] : null;

    const POWER_PASS_CELLS = ['sand-portal-0', 'sand-portal-1', 'sand-portal-2', 'sand-portal-3', 'sand-portal-4', 'sand-portal-5', 'sand-portal-6', 'sand-portal-7', 'sand-portal-8'];

    if (cellType == 'wire') {
        return;
    }

    let cameFromDirections = cellType.split('-')[2]; // e.g., 'p-l', 'p-d-u', etc.
    
    let passDirections = [];
    if (POWER_PASS_CELLS.includes(cellAtRight) && !cameFromDirections.includes('r')) {
        passDirections.push('right');
    }
    if (POWER_PASS_CELLS.includes(cellAtLeft) && !cameFromDirections.includes('l')) {
        passDirections.push('left');
    }
    if (POWER_PASS_CELLS.includes(cellAtBelow) && !cameFromDirections.includes('d')) {
        passDirections.push('below');
    }
    if (POWER_PASS_CELLS.includes(cellAtAbove) && !cameFromDirections.includes('u')) {
        passDirections.push('above');
    }

    if (passDirections.length > 0) {
        let choice = passDirections[Math.floor(Math.random() * passDirections.length)];
        switch (choice) {
            case 'right':
                handleWirePowerPass({ x, y }, { x: x + 1, y: y });
                break;
            case 'left':
                handleWirePowerPass({ x, y }, { x: x - 1, y: y });
                break;
            case 'below':
                handleWirePowerPass({ x, y }, { x: x, y: y + 1 });
                break;
            case 'above':
                handleWirePowerPass({ x, y }, { x: x, y: y - 1 });
                break;
        }

        return;
    }

    if (cellAtRight == 'wire' && !cameFromDirections.includes('r')) {
        passDirections.push('right');
    }
    if (cellAtLeft == 'wire' && !cameFromDirections.includes('l')) {
        passDirections.push('left');
    }
    if (cellAtBelow == 'wire' && !cameFromDirections.includes('d')) {
        passDirections.push('below');
    }
    if (cellAtAbove == 'wire' && !cameFromDirections.includes('u')) {
        passDirections.push('above');
    }

    if (passDirections.length == 0) {
        GAME_STATE.nextGrid[y][x] = 'wire';
        return;
    }

    let choice = passDirections[Math.floor(Math.random() * passDirections.length)];
    switch (choice) {
        case 'right':
            GAME_STATE.nextGrid[y][x + 1] = `wire-p-l` as Cell;
            break;
        case 'left':
            GAME_STATE.nextGrid[y][x - 1] = `wire-p-r` as Cell;
            break;
        case 'below':
            GAME_STATE.nextGrid[y + 1][x] = `wire-p-u` as Cell;
            break;
        case 'above':
            GAME_STATE.nextGrid[y - 1][x] = `wire-p-d` as Cell;
            break;
    }
    GAME_STATE.nextGrid[y][x] = 'wire';
}

function handleWirePowerPass(pos: { x: number, y: number }, targetPos: { x: number, y: number }) {
    let targetCell = GAME_STATE.nextGrid[targetPos.y][targetPos.x];
    const SAND_PORTAL_CELLS = ['sand-portal-0', 'sand-portal-1', 'sand-portal-2', 'sand-portal-3', 'sand-portal-4', 'sand-portal-5', 'sand-portal-6', 'sand-portal-7', 'sand-portal-8'];

    if (SAND_PORTAL_CELLS.includes(targetCell)) {
        GAME_STATE.nextGrid[targetPos.y][targetPos.x] = `sand-portal-8` as Cell;
        GAME_STATE.nextGrid[pos.y][pos.x] = 'wire';
    }
}

export function seedAutomata(x: number, y: number, cellType: Cell) {

    let belowCell = y + 1 < GAME_STATE.height ? GAME_STATE.nextGrid[y + 1][x] : null;
    let belowLeftCell = (x - 1 >= 0 && y + 1 < GAME_STATE.height) ? GAME_STATE.nextGrid[y + 1][x - 1] : null;
    let belowRightCell = (x + 1 < GAME_STATE.width && y + 1 < GAME_STATE.height) ? GAME_STATE.nextGrid[y + 1][x + 1] : null;

    const DIRT_TYPES = ['dirt', 'wet-dirt'];

    if (DIRT_TYPES.includes(belowCell)) {
        GAME_STATE.nextGrid[y + 1][x] = (belowCell == 'dirt' ? 'dirt-with-seed' : 'wet-dirt-with-seed');
        GAME_STATE.nextGrid[y][x] = 'empty';
        console.log('Seed planted downward at', x, y);
        return;
    }

    sandAutomata(x, y, cellType);
}

export function waterVaporAutomata(x: number, y: number, cellType: Cell) {
    // if (cellType === 'water-vapor-4') {
    //     GAME_STATE.nextGrid[y][x] = 'empty';
    //     GAME_STATE.nextGrid[y][x] = 'water';
    //     return;
    // }
}