import { ADD_CELL_MAP, CANVAS, GAME_STATE, getCellAtPos, TARGET_FPS, updateSandCount } from "..";

const NON_BLOOM_CELL_TYPES = ['stone', 'hole', 'sand-portal-0', 'water-portal', 'torch', 'empty', 'steam-engine-0', 'wire'];
const MAX_DROP_RATE_TYPES = ['seed'];
const MAX_DROP_RATE = 5;

function getMousePosCell(e: MouseEvent) {
    const rect = CANVAS.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const squareSizeWidth = Math.floor(CANVAS.width / GAME_STATE.width);
    const squareSizeHeight = Math.floor(CANVAS.height / GAME_STATE.height);
    const gridX = Math.floor(x / squareSizeWidth);
    const gridY = Math.floor(y / squareSizeHeight);
    return { x: gridX, y: gridY };
}

export function clickHandler() {
    CANVAS.onclick = function (e) {
        if (GAME_STATE.holdToSandUnlocked) {
            return;
        }
        addCellAtMouse(getMousePosCell(e));
        if (GAME_STATE.drawCell === 'sand') {
            updateSandCount();
        }
    };

    // on mouse hold, continually add sand on the mouse position
    CANVAS.onmousedown = function (e) {
        GAME_STATE.mouseDown = true;
    }

    CANVAS.onmouseup = function (e) {
        GAME_STATE.mouseDown = false;
    }

    CANVAS.onmousemove = function (e) {
        GAME_STATE.mouseMove = true;
        let { x, y } = getMousePosCell(e);
        GAME_STATE.mousePosX = x;
        GAME_STATE.mousePosY = y;
    }

    CANVAS.onmouseleave = function (e) {
        GAME_STATE.mouseDown = false;
        GAME_STATE.mouseEntered = false;
    }

    CANVAS.onmouseenter = function (e) {
        GAME_STATE.mouseEntered = true;
    }
}

export function holdSpawnUpdate() {

    let now = Date.now();

    let sandPerSecond = GAME_STATE.sandPerSecond;
    if (MAX_DROP_RATE_TYPES.includes(GAME_STATE.drawCell)) {
        sandPerSecond = MAX_DROP_RATE;
    }
    
    if (
        GAME_STATE.mouseDown &&
        GAME_STATE.mouseEntered &&
        (
            (
                GAME_STATE.lastSandAddTime + (1000 / sandPerSecond) < now &&
                GAME_STATE.holdToSandUnlocked
            ) ||
            NON_BLOOM_CELL_TYPES.includes(GAME_STATE.drawCell)
        )
    ) {
        let sandSpawnAmt = sandPerSecond / TARGET_FPS;
        for (let i = 0; i < sandSpawnAmt; i++) {
            addCellAtMouse({x: GAME_STATE.mousePosX, y: GAME_STATE.mousePosY});
            if (GAME_STATE.drawCell === 'sand') {
                updateSandCount();
            }
        }
        GAME_STATE.lastSandAddTime = now;
    }
}

function addCellAtMouse({x, y}: {x: number, y: number}) {

    // if (GAME_STATE.drawCell === 'hole') {
    //     console.log('adding hole at', x, y);
    // }

    

    let cellAtPos = getCellAtPos(x, y);
    let cellAtRight = getCellAtPos(x + 1, y);
    let cellAtLeft = getCellAtPos(x - 1, y);
    let cellAtBelow = getCellAtPos(x, y + 1);
    let cellAtAbove = getCellAtPos(x, y - 1);
    let cellAtAboveLeft = getCellAtPos(x - 1, y - 1);
    let cellAtAboveRight = getCellAtPos(x + 1, y - 1);
    let cellAtBelowLeft = getCellAtPos(x - 1, y + 1);
    let cellAtBelowRight = getCellAtPos(x + 1, y + 1);

    let emptyCells = [];
    if (cellAtPos !== 'empty' && !NON_BLOOM_CELL_TYPES.includes(GAME_STATE.drawCell)) {
        if (cellAtRight === 'empty') {
            emptyCells.push('right');
        }
        if (cellAtLeft === 'empty') {
            emptyCells.push('left');
        }
        if (cellAtBelow === 'empty') {
            emptyCells.push('below');
        }
        if (cellAtAbove === 'empty') {
            emptyCells.push('above');
        }
        if (cellAtBelowRight === 'empty') {
            emptyCells.push('below-right');
        }
        if (cellAtBelowLeft === 'empty') {
            emptyCells.push('below-left');
        }
        if (cellAtAboveRight === 'empty') {
            emptyCells.push('above-right');
        }
        if (cellAtAboveLeft === 'empty') {
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

    if (x < 0 || x >= GAME_STATE.width || y < 0 || y >= GAME_STATE.height) {
        return;
    }

    ADD_CELL_MAP.set(`${x},${y}`, { x, y, type: GAME_STATE.drawCell });
}