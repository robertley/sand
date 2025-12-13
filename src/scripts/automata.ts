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

    let { cellBelowLeft, cellBelowRight, cellBelow } = getNeighborCells(x, y);

    // const leftBelowCell = x - 1 >= 0 ? GAME_STATE.nextGrid[y + 1][x - 1] : null;
    // const rightBelowCell = x + 1 < GAME_STATE.width ? GAME_STATE.nextGrid[y + 1][x + 1] : null;

    if (FALL_CELLS.includes(cellBelow)) {
        if (holeCheck({ x, y }, { x: x, y: y + 1 })) {
            return;
        }
        GAME_STATE.nextGrid[y + 1][x] = cellType;
        GAME_STATE.nextGrid[y][x] = cellBelow;
        return;
    }

    const leftEmpty = FALL_CELLS.includes(cellBelowLeft);
    const rightEmpty = FALL_CELLS.includes(cellBelowRight);

    let moveX;
    let moveY = y + 1;
    let moveCell;

    if (leftEmpty && rightEmpty) {
        // randomly choose left or right

        if (Math.random() < 0.5) {
            moveCell = cellBelowRight;
            moveX = x - 1;
        } else {
            moveCell = cellBelowLeft;
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
        moveCell = cellBelowLeft;
    } else if (rightEmpty) {
        moveX = x + 1;
        moveCell = cellBelowRight;
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
        let {
            cellBelow,
            cellLeft,
            cellRight,
            cellAbove,
            cellBelowLeft,
            cellBelowRight,
            cellAboveLeft,
            cellAboveRight
        } = getNeighborCells(x, y);

        let neighboringWaterCells = [];
        let neightborWetDirtCells = [];
        let neightborDryDirtCellsBelow = [];
        let neightborDryDirtCellsAbove = [];
        let neighborEmptyCells = [];

        if (WATER_CELLS.includes(cellBelow)) {
            neighboringWaterCells.push({ x: x, y: y + 1 });
        } else if (WET_DIRT_CELLS.includes(cellBelow)) {
            neightborWetDirtCells.push({ x: x, y: y + 1, cellType: cellBelow });
        } else if (DRY_DIRT_CELLS.includes(cellBelow)) {
            neightborDryDirtCellsBelow.push({ x: x, y: y + 1, cellType: cellBelow });
        } else if (cellBelow === 'empty') {
            neighborEmptyCells.push({ x: x, y: y + 1 });
        }
        if (WATER_CELLS.includes(cellLeft)) {
            neighboringWaterCells.push({ x: x - 1, y: y });
        } else if (WET_DIRT_CELLS.includes(cellLeft)) {
            neightborWetDirtCells.push({ x: x - 1, y: y, cellType: cellLeft });
        } else if (DRY_DIRT_CELLS.includes(cellLeft)) {
            neightborDryDirtCellsBelow.push({ x: x - 1, y: y, cellType: cellLeft });
        } else if (cellLeft === 'empty') {
            neighborEmptyCells.push({ x: x - 1, y: y });
        }
        if (WATER_CELLS.includes(cellRight)) {
            neighboringWaterCells.push({ x: x + 1, y: y });
        } else if (WET_DIRT_CELLS.includes(cellRight)) {
            neightborWetDirtCells.push({ x: x + 1, y: y, cellType: cellRight });
        } else if (DRY_DIRT_CELLS.includes(cellRight)) {
            neightborDryDirtCellsBelow.push({ x: x + 1, y: y, cellType: cellRight });
        } else if (cellRight === 'empty') {
            neighborEmptyCells.push({ x: x + 1, y: y });
        }
        if (WATER_CELLS.includes(cellAbove)) {
            neighboringWaterCells.push({ x: x, y: y - 1 });
        } else if (WET_DIRT_CELLS.includes(cellAbove)) {
            neightborWetDirtCells.push({ x: x, y: y - 1, cellType: cellAbove });
        } else if (DRY_DIRT_CELLS.includes(cellAbove)) {
            neightborDryDirtCellsAbove.push({ x: x, y: y - 1, cellType: cellAbove });
        } else if (cellAbove === 'empty') {
            neighborEmptyCells.push({ x: x, y: y - 1 });
        }
        if (WATER_CELLS.includes(cellBelowLeft)) {
            neighboringWaterCells.push({ x: x - 1, y: y + 1 });
        } else if (WET_DIRT_CELLS.includes(cellBelowLeft)) {
            neightborWetDirtCells.push({ x: x - 1, y: y + 1, cellType: cellBelowLeft });
        } else if (DRY_DIRT_CELLS.includes(cellBelowLeft)) {
            neightborDryDirtCellsBelow.push({ x: x - 1, y: y + 1, cellType: cellBelowLeft });
        } else if (cellBelowLeft === 'empty') {
            neighborEmptyCells.push({ x: x - 1, y: y + 1 });
        }
        if (WATER_CELLS.includes(cellBelowRight)) {
            neighboringWaterCells.push({ x: x + 1, y: y + 1 });
        } else if (WET_DIRT_CELLS.includes(cellBelowRight)) {
            neightborWetDirtCells.push({ x: x + 1, y: y + 1, cellType: cellBelowRight });
        } else if (DRY_DIRT_CELLS.includes(cellBelowRight)) {
            neightborDryDirtCellsBelow.push({ x: x + 1, y: y + 1, cellType: cellBelowRight });
        } else if (cellBelowRight === 'empty') {
            neighborEmptyCells.push({ x: x + 1, y: y + 1 });
        }
        if (WATER_CELLS.includes(cellAboveLeft)) {
            neighboringWaterCells.push({ x: x - 1, y: y - 1 });
        } else if (WET_DIRT_CELLS.includes(cellAboveLeft)) {
            neightborWetDirtCells.push({ x: x - 1, y: y - 1, cellType: cellAboveLeft });
        } else if (DRY_DIRT_CELLS.includes(cellAboveLeft)) {
            neightborDryDirtCellsAbove.push({ x: x - 1, y: y - 1, cellType: cellAboveLeft });
        } else if (cellAboveLeft === 'empty') {
            neighborEmptyCells.push({ x: x - 1, y: y - 1 });
        }
        if (WATER_CELLS.includes(cellAboveRight)) {
            neighboringWaterCells.push({ x: x + 1, y: y - 1 });
        } else if (WET_DIRT_CELLS.includes(cellAboveRight)) {
            neightborWetDirtCells.push({ x: x + 1, y: y - 1, cellType: cellAboveRight });
        } else if (DRY_DIRT_CELLS.includes(cellAboveRight)) {
            neightborDryDirtCellsAbove.push({ x: x + 1, y: y - 1, cellType: cellAboveRight });
        } else if (cellAboveRight === 'empty') {
            neighborEmptyCells.push({ x: x + 1, y: y - 1 });
        }


        if (DRY_DIRT_CELLS.includes(cellType)) {
            let waterTransferCells = [];
            if (neighboringWaterCells.length > 0) {
                let choice = neighboringWaterCells[Math.floor(Math.random() * neighboringWaterCells.length)];
                GAME_STATE.nextGrid[choice.y][choice.x] = 'empty';
                cellType = (cellType === 'dirt' ? 'wet-dirt' : `wet-dirt-with-seed-${GAME_STATE._tickCount}`);
                GAME_STATE.nextGrid[y][x] = cellType;

                // prioritize watering dry dirt below first
                if (neightborDryDirtCellsBelow.length > 0) {
                    let choice = neightborDryDirtCellsBelow[Math.floor(Math.random() * neightborDryDirtCellsBelow.length)];
                    GAME_STATE.nextGrid[choice.y][choice.x] = (choice.cellType === 'dirt' ? 'wet-dirt' : `wet-dirt-with-seed-${GAME_STATE._tickCount}`);
                    return;
                }
                if (neightborDryDirtCellsAbove.length > 0) {
                    let choice = neightborDryDirtCellsAbove[Math.floor(Math.random() * neightborDryDirtCellsAbove.length)];
                    GAME_STATE.nextGrid[choice.y][choice.x] = (choice.cellType === 'dirt' ? 'wet-dirt' : `wet-dirt-with-seed-${GAME_STATE._tickCount}`);
                }
                return;
            }
        }
        
        // if (WET_DIRT_CELLS.includes(cellType) && GAME_STATE._tickCount % 5 == 0) {

        //     let waterTransferCells = [];
        //     if (DRY_DIRT_CELLS.includes(belowCell)) {
        //         waterTransferCells.push({ x: x, y: y + 1, cellType: belowCell });
        //     }
        //     if (DRY_DIRT_CELLS.includes(belowLeftCell)) {
        //         waterTransferCells.push({ x: x - 1, y: y, cellType: belowLeftCell });
        //     }
        //     if (DRY_DIRT_CELLS.includes(belowRightCell)) {
        //         waterTransferCells.push({ x: x + 1, y: y + 1, cellType: belowRightCell });
        //     }
        //     if (waterTransferCells.length > 0) {
        //         const choice = waterTransferCells[Math.floor(Math.random() * waterTransferCells.length)];
        //         GAME_STATE.nextGrid[choice.y][choice.x] = (choice.cellType === 'dirt' ? 'wet-dirt' : 'wet-dirt-with-seed');
        //         cellType = (cellType === 'wet-dirt' ? 'dirt' : 'dirt-with-seed');
        //         GAME_STATE.nextGrid[y][x] = cellType;
        //     }
        // }

        if (WET_DIRT_CELLS.includes(cellType) &&
            GAME_STATE._tickCount % 17 == 0
        ) {
            // if (
            //     neighboringWaterCells.length === 0 &&
            //     (
            //         neighborEmptyCells.length > 0 ||
            //         neightborWetDirtCells.length < 3
            //     )
            // ) {
            // check if there is a water cell within 2 cells
            let foundWaterNearby = false;
            for (let dx = -2; dx <= 2; dx++) {
                for (let dy = -2; dy <= 2; dy++) {
                    if (dx === 0 && dy === 0) continue;
                    let checkX = x + dx;
                    let checkY = y + dy;
                    if (checkX >= 0 && checkX < GAME_STATE.width && checkY >= 0 && checkY < GAME_STATE.height) {
                        let checkCell = GAME_STATE.nextGrid[checkY][checkX];
                        if (WATER_CELLS.includes(checkCell) || STEAM_ENGINE_CELLS.includes(checkCell)) {
                            foundWaterNearby = true;
                            break;
                        }
                    }
                }
                if (foundWaterNearby) break;
            }
            if (!foundWaterNearby) {
                let chanceToDry = 0.005;
                if (Math.random() < chanceToDry) {
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

    let { cellBelow, cellLeft, cellRight, cellBelowLeft, cellBelowRight } = getNeighborCells(x, y);

    if (FALL_CELLS.includes(cellBelow)) {
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

        if (FALL_CELLS.includes(cellBelowLeft)) {
            if (waterCellType === 'water-left') {
                foundDirected = 'bottom-left';
            }
            emptyCells.push('bottom-left');
        }
        if (FALL_CELLS.includes(cellBelowRight)) {
            if (waterCellType === 'water-right') {
                foundDirected = 'bottom-right';
            }
            emptyCells.push('bottom-right');
        }

        // prioritize bottom left/right over left/right
        if (emptyCells.length === 0) {
            if (FALL_CELLS.includes(cellLeft)) {
                if (waterCellType === 'water-left') {
                    foundDirected = 'left';
                }
                emptyCells.push('left');
            }
            if (FALL_CELLS.includes(cellRight)) {
                if (waterCellType === 'water-right') {
                    foundDirected = 'right';
                }
                emptyCells.push('right');
            }
        }

        // no empty cells to move into
        if (emptyCells.length === 0) {
            // GAME_STATE.nextGrid[y][x] = 'water';
            // not sure if I like water vapor
            // waterVaporCheck({ x, y });
            return; // cannot move
        }

        const choice = foundDirected ?? emptyCells[Math.floor(Math.random() * emptyCells.length)];
        switch (choice) {
            case 'left':
                moveX = x - 1;
                moveCell = cellLeft;
                waterCellType = 'water-left';
                break;
            case 'right':
                moveX = x + 1;
                moveCell = cellRight;
                waterCellType = 'water-right';
                break;
            case 'bottom-left':
                moveX = x - 1;
                moveY = y + 1;
                moveCell = cellBelowLeft;
                waterCellType = 'water-left';
                break;
            case 'bottom-right':
                moveX = x + 1;
                moveY = y + 1;
                moveCell = cellBelowRight;
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
   
    let { cellBelow, cellBelowLeft, cellBelowRight } = getNeighborCells(x, y);

    const FALL_STRAIGHT_DOWN_CELLS = ['seed'];

    let waterBelowCells = [];
    if (WATER_CELLS.includes(cellBelow)) {
        waterBelowCells.push('center');

        if (FALL_STRAIGHT_DOWN_CELLS.includes(cellType)) {
            GAME_STATE.nextGrid[y + 1][x] = cellType;
            GAME_STATE.nextGrid[y][x] = 'water';
            return;
        }
    }
    if (WATER_CELLS.includes(cellBelowLeft)) {
        waterBelowCells.push('left');
    }
    if (WATER_CELLS.includes(cellBelowRight)) {
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

    let { cellAbove, cellLeft, cellRight, cellAboveLeft, cellAboveRight } = getNeighborCells(x, y);

    let fireAboveCells = [];
    if (FIRE_INTERACT_CELLS.includes(cellAbove)) {
        fireAboveCells.push('center');
    }
    if (FIRE_INTERACT_CELLS.includes(cellAboveLeft)) {
        fireAboveCells.push('left-upper');
    }
    if (FIRE_INTERACT_CELLS.includes(cellAboveRight)) {
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
                moveCell = cellAbove;
                break;
            case 'left-upper':
                moveX = x - 1;
                moveY = y - 1;
                moveCell = cellAboveLeft;
                break;
            case 'right-upper':
                moveX = x + 1;
                moveY = y - 1;
                moveCell = cellAboveRight;
                break;
        } 
    } else {
        if (FIRE_INTERACT_CELLS.includes(cellLeft)) {
            fireAboveCells.push('left');
        }
        if (FIRE_INTERACT_CELLS.includes(cellRight)) {
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
                moveCell = cellLeft;
                break;
            case 'right':
                moveX = x + 1;
                moveCell = cellRight;
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

    let { cellAbove, cellLeft, cellRight, cellAboveLeft, cellAboveRight } = getNeighborCells(x, y);

    let fallAboveCells = [];
    if (
        (STEAM_INTERACTION_CELLS.includes(cellAbove) && cellType === 'steam') ||
        (VAPOR_INTERACTION_CELLS.includes(cellAbove) && cellType.startsWith('water-vapor'))
    ) {
        fallAboveCells.push('center');
    }
    if (
        (STEAM_INTERACTION_CELLS.includes(cellAboveLeft) && cellType === 'steam') ||
        (VAPOR_INTERACTION_CELLS.includes(cellAboveLeft) && cellType.startsWith('water-vapor'))
    ) {
        fallAboveCells.push('left-upper');
    }
    if (
        (STEAM_INTERACTION_CELLS.includes(cellAboveRight) && cellType === 'steam') ||
        (VAPOR_INTERACTION_CELLS.includes(cellAboveRight) && cellType.startsWith('water-vapor'))
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
                moveCell = cellAbove;
                break;
            case 'left-upper':
                moveX = x - 1;
                moveY = y - 1;
                moveCell = cellAboveLeft;
                break;
            case 'right-upper':
                moveX = x + 1;
                moveY = y - 1;
                moveCell = cellAboveRight;
                break;
        } 
    } else {
        if (STEAM_INTERACTION_CELLS.includes(cellLeft)) {
            fallAboveCells.push('left');
        }
        if (STEAM_INTERACTION_CELLS.includes(cellRight)) {
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
                moveCell = cellLeft;
                break;
            case 'right':
                moveX = x + 1;
                moveCell = cellRight;
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
    let { cellAbove, cellLeft, cellRight, cellBelow } = getNeighborCells(x, y);

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
        if (cellLeft === 'wire') {
            wirePassCells.push('left');
        }
        if (cellRight === 'wire') {
            wirePassCells.push('right');
        }
        if (cellAbove === 'wire') {
            wirePassCells.push('above');
        }
        if (cellBelow === 'wire') {
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


    if (STEAM_ENGINE_CELLS.includes(cellLeft)) {
        let neighborState = parseInt(cellLeft.split('-')[2]);
        if (neighborState < engineState) {
            canPassPowerCells.push('left');
        }
    }
    if (STEAM_ENGINE_CELLS.includes(cellRight)) {
        let neighborState = parseInt(cellRight.split('-')[2]);
        if (neighborState < engineState) {
            canPassPowerCells.push('right');
        }
    }
    if (STEAM_ENGINE_CELLS.includes(cellAbove)) {
        let neighborState = parseInt(cellAbove.split('-')[2]);
        if (neighborState < engineState) {
            canPassPowerCells.push('above');
        }
    }
    if (STEAM_ENGINE_CELLS.includes(cellBelow)) {
        let neighborState = parseInt(cellBelow.split('-')[2]);
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
            neighborState = parseInt(cellLeft.split('-')[2]);
            GAME_STATE.nextGrid[y][x - 1] = `steam-engine-${Math.min(neighborState + 1, 4)}` as Cell;
            break;
        case 'right':
            neighborState = parseInt(cellRight.split('-')[2]);
            GAME_STATE.nextGrid[y][x + 1] = `steam-engine-${Math.min(neighborState + 1, 4)}` as Cell;
            break;
        case 'above':
            neighborState = parseInt(cellAbove.split('-')[2]);
            GAME_STATE.nextGrid[y - 1][x] = `steam-engine-${Math.min(neighborState + 1, 4)}` as Cell;
            break;
        case 'below':
            neighborState = parseInt(cellBelow.split('-')[2]);
            GAME_STATE.nextGrid[y + 1][x] = `steam-engine-${Math.min(neighborState + 1, 4)}` as Cell;
            break;
    }

    GAME_STATE.nextGrid[y][x] = `steam-engine-${Math.max(engineState - lostEnergy, 0)}` as Cell;
}

export function wireAutomata(x: number, y: number, cellType: Cell) {
    let cellAtPos = GAME_STATE.nextGrid[y][x];
    let { cellLeft, cellRight, cellAbove, cellBelow } = getNeighborCells(x, y);

    const POWER_PASS_CELLS = ['sand-portal-0', 'sand-portal-1', 'sand-portal-2', 'sand-portal-3', 'sand-portal-4', 'sand-portal-5', 'sand-portal-6', 'sand-portal-7', 'sand-portal-8'];

    if (cellType == 'wire') {
        return;
    }

    let cameFromDirections = cellType.split('-')[2]; // e.g., 'p-l', 'p-d-u', etc.
    
    let passDirections = [];
    if (POWER_PASS_CELLS.includes(cellRight) && !cameFromDirections.includes('r')) {
        passDirections.push('right');
    }
    if (POWER_PASS_CELLS.includes(cellLeft) && !cameFromDirections.includes('l')) {
        passDirections.push('left');
    }
    if (POWER_PASS_CELLS.includes(cellBelow) && !cameFromDirections.includes('d')) {
        passDirections.push('below');
    }
    if (POWER_PASS_CELLS.includes(cellAbove) && !cameFromDirections.includes('u')) {
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

    if (cellRight == 'wire' && !cameFromDirections.includes('r')) {
        passDirections.push('right');
    }
    if (cellLeft == 'wire' && !cameFromDirections.includes('l')) {
        passDirections.push('left');
    }
    if (cellBelow == 'wire' && !cameFromDirections.includes('d')) {
        passDirections.push('below');
    }
    if (cellAbove == 'wire' && !cameFromDirections.includes('u')) {
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

    let { cellBelow, cellAbove } = getNeighborCells(x, y);

    const DIRT_TYPES = ['dirt', 'wet-dirt'];

    if (DIRT_TYPES.includes(cellBelow)) {

        // this logic isnt great, forsure doesn't work well in every situation
        let replaceType: Cell = 'empty';
        if (cellAbove == 'water') {
            replaceType = 'water';
        }

        GAME_STATE.nextGrid[y + 1][x] = (cellBelow == 'dirt' ? 'dirt-with-seed' : `wet-dirt-with-seed-${GAME_STATE._tickCount}`);
        GAME_STATE.nextGrid[y][x] = replaceType;
        return;
    }

    // if ()

    sandAutomata(x, y, cellType);
}

export function wetDirtWithSeedAutomata(x: number, y: number, cellType: Cell) {
    let { cellAbove, cellAboveLeft, cellAboveRight } = getNeighborCells(x, y);

    if (cellAbove === 'empty' && cellAboveLeft === 'empty' && cellAboveRight === 'empty') {
        trunkGrow(x, y, cellType);
        return;
    }

    if (WATER_CELLS.includes(cellAbove) && (WATER_CELLS.includes(cellAboveLeft) || WATER_CELLS.includes(cellAboveRight))) {
        seaweedGrow(x, y, cellType);
        return;
    }


}

const TREE_TRUNK_COLORS = ['#1d0f05ff', '#bdbdbdff', '#241409ff', '#462708ff', '#130e09ff'];

function trunkGrow(x: number, y: number, cellType: Cell) {
    let growChance = 0.01;
    if (Math.random() < growChance) {
        let trunkHeight = 3 + Math.floor(Math.random() * 3);
        let color = TREE_TRUNK_COLORS[Math.floor(Math.random() * TREE_TRUNK_COLORS.length)];
        GAME_STATE.nextGrid[y - 1][x] = `trunk-${trunkHeight}-${GAME_STATE._tickCount}-${color}`;
    }
}

function seaweedGrow(x: number, y: number, cellType: Cell) {

    let growChance = 0.5;
    if (Math.random() < growChance) {
        let randomGreenValue = Math.floor(Math.random() * 50) + 100; // 140 to 255
        let trunkHeight = 3;
        let seaweedCell = `seaweed-${trunkHeight}-${GAME_STATE._tickCount}-${randomGreenValue}`;
        console.log('growing new seaweed', seaweedCell);
        GAME_STATE.nextGrid[y - 1][x] = seaweedCell as Cell;
    }
}

export function trunkAutomata(x: number, y: number, cellType: Cell) {
    let trunkHeight = parseInt(cellType.split('-')[1]);
    let color = cellType.split('-')[3];

    let { cellAbove } = getNeighborCells(x, y);
    if (cellAbove !== 'empty') {
        return;
    }

    if (GAME_STATE._tickCount % 20 == 0 && trunkHeight > 0) {
        let growChance = 0.5;
        if (Math.random() < growChance) {
            console.log('growing trunk at', x, y, color);
            GAME_STATE.nextGrid[y - 1][x] = `trunk-${trunkHeight - 1}-${GAME_STATE._tickCount}-${color}`;
        }
    }

}

export function seaweedAutomata(x: number, y: number, cellType: Cell) {
    let seaweedHeight = parseInt(cellType.split('-')[1]);
    let { cellAbove } = getNeighborCells(x, y);
    if (cellAbove !== 'water') {
        return;
    }

    if (GAME_STATE._tickCount % 20 == 0 && seaweedHeight > 0) {
        let growChance = 0.1;
        if (Math.random() < growChance) {
            let startingTickCount = cellType.split('-')[2];
            // GAME_STATE.nextGrid[y - 1][x] = `seaweed-${seaweedHeight - 1}-${GAME_STATE._tickCount}-${cellBelowGreen}`;
            GAME_STATE.nextGrid[y - 1][x] = `seaweed-${seaweedHeight - 1}-${+startingTickCount}`;
        }
    }

    sandAutomata(x, y, cellType);
}

export function fishAutomata(x: number, y: number, cellType: Cell) {
    let { cellLeft, cellRight, cellAbove, cellBelow } = getNeighborCells(x, y);
    let fishStatus = cellType.split('-')[1];
    let nextMove = +cellType.split('-')[2];
    let fishType = cellType.split('-')[3];


    if (FALL_CELLS.includes(cellBelow)) {
        if (holeCheck({ x, y }, { x: x, y: y + 1 })) {
            return;
        }
        GAME_STATE.nextGrid[y + 1][x] = `fish-falling-${nextMove}-${fishType}` as Cell;
        GAME_STATE.nextGrid[y][x] = cellBelow;
        return;
    }

    if (fishStatus == 'falling' && (WATER_CELLS.includes(cellBelow))) {
        GAME_STATE.nextGrid[y + 1][x] = `fish-swimming-${nextMove}-${fishType}` as Cell;
        GAME_STATE.nextGrid[y][x] = 'empty';
        return;
    }

    if (fishStatus == 'swimming' && (GAME_STATE._tickCount) % nextMove === 0) {
        let waterCells = [];
        if (WATER_CELLS.includes(cellLeft)) {
            waterCells.push('left');
        }
        if (WATER_CELLS.includes(cellRight)) {
            waterCells.push('right');
        }
        if (WATER_CELLS.includes(cellAbove)) {
            waterCells.push('above');
        }
        if (WATER_CELLS.includes(cellBelow)) {
            waterCells.push('below');
        }
        if (waterCells.length == 0) {
            return;
        }
        const choice = waterCells[Math.floor(Math.random() * waterCells.length)];
        let moveX = x;
        let moveY = y;
        let moveCell = null;
        switch (choice) {
            case 'left':
                moveX = x - 1;
                moveCell = cellLeft;
                break;
            case 'right':
                moveX = x + 1;
                moveCell = cellRight;
                break;
            case 'above':
                moveY = y - 1;
                moveCell = cellAbove;
                break;
            case 'below':
                moveY = y + 1;
                moveCell = cellBelow;
                break;
        }
        let nextMove = Math.floor(Math.random() * 30) + 60;
        GAME_STATE.nextGrid[moveY][moveX] = `fish-swimming-${nextMove}-${fishType}` as Cell;
        GAME_STATE.nextGrid[y][x] = moveCell;
        return;
    }
}

function getNeighborCells(x: number, y: number): 
{
    cellLeft: Cell | null,
    cellRight: Cell | null,
    cellAbove: Cell | null,
    cellBelow: Cell | null,
    cellAboveLeft: Cell | null,
    cellAboveRight: Cell | null,
    cellBelowLeft: Cell | null,
    cellBelowRight: Cell | null
} {
    let resp = {
        cellLeft: x - 1 >= 0 ? GAME_STATE.nextGrid[y][x - 1] : null,
        cellRight: x + 1 < GAME_STATE.width ? GAME_STATE.nextGrid[y][x + 1] : null,
        cellAbove: y - 1 >= 0 ? GAME_STATE.nextGrid[y - 1][x] : null,
        cellBelow: y + 1 < GAME_STATE.height ? GAME_STATE.nextGrid[y + 1][x] : null,
        cellAboveLeft: (x - 1 >= 0 && y - 1 >= 0) ? GAME_STATE.nextGrid[y - 1][x - 1] : null,
        cellAboveRight: (x + 1 < GAME_STATE.width && y - 1 >= 0) ? GAME_STATE.nextGrid[y - 1][x + 1] : null,
        cellBelowLeft: (x - 1 >= 0 && y + 1 < GAME_STATE.height) ? GAME_STATE.nextGrid[y + 1][x - 1] : null,
        cellBelowRight: (x + 1 < GAME_STATE.width && y + 1 < GAME_STATE.height) ? GAME_STATE.nextGrid[y + 1][x + 1] : null,
    };

    // console.log('neighbor cells at', x, y, resp);
    return resp;
}

export function waterVaporAutomata(x: number, y: number, cellType: Cell) {
    // if (cellType === 'water-vapor-4') {
    //     GAME_STATE.nextGrid[y][x] = 'empty';
    //     GAME_STATE.nextGrid[y][x] = 'water';
    //     return;
    // }
}