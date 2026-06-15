import { GAME, setGridSize } from "..";
import { checkButtonsDisabled } from "./buttons";


const DEBUG_TOGGLE = document.getElementById('debugToggle') as HTMLInputElement;
const DEBUG_FORM_CONTAINER = document.getElementById('debugFormContainer');

DEBUG_TOGGLE.onchange = function () {
    GAME.debugMode = DEBUG_TOGGLE.checked;
    if (GAME.debugMode) {
        showDebugForm();
    } else {
        // @ts-ignore
        DEBUG_FORM_CONTAINER.innerHTML = '';
    }
        
}

function showDebugForm() {
    let table = document.createElement('table');
    // @ts-ignore
    DEBUG_FORM_CONTAINER.appendChild(table);
    for (const key of Object.keys(GAME) as (keyof typeof GAME)[]) {
        let row = document.createElement('tr');
        table.appendChild(row);
        let labelCell = document.createElement('td');
        labelCell.innerText = key;
        row.appendChild(labelCell);
        let inputCell = document.createElement('td');
        row.appendChild(inputCell);
        let input = document.createElement('input');
        input.type = 'text';
        input.id = `debug-input-${key}`;
        input.value = GAME[key]?.toString?.() ?? '';
        input.onchange = function () {
            console.log(`Changing ${key} to`, input.value);
            const currentType = typeof GAME[key];
            if (currentType === 'number') {
                const newValue = parseFloat(input.value);
                if (!isNaN(newValue)) {
                    (GAME as any)[key] = newValue;
                } else {
                    input.value = (GAME as any)[key]?.toString?.() ?? '';
                }
            } else if (currentType === 'string') {
                (GAME as any)[key] = input.value;
            } else if (currentType === 'boolean') {
                (GAME as any)[key] = (input.value.toLowerCase() === 'true');
            }

            if (key === 'width' || key === 'height') {
                setGridSize(GAME.width, GAME.height);
            }
            checkButtonsDisabled();
        };
        inputCell.appendChild(input);
    }
}

export function formInit() {
    if (GAME.debugMode) {
        showDebugForm();
    }
}

// SPS_INPUT.onchange = function () {
//     const newSPS = parseInt(SPS_INPUT.value);
//     if (!isNaN(newSPS) && newSPS > 0) {
//         console.log('setting sps to', newSPS);
//         GAME.sandPerSecond = newSPS;
//     } else {
//         SPS_INPUT.value = GAME.sandPerSecond.toString();
//     }
// }

// PORTAL_SPAWN_RATE_INPUT.onchange = function () {
//     const newRate = parseInt(PORTAL_SPAWN_RATE_INPUT.value);
//     if (!isNaN(newRate) && newRate > 0) {
//         GAME.sandPortalRate = newRate;
//     } else {
//         PORTAL_SPAWN_RATE_INPUT.value = GAME.sandPortalRate.toString();
//     }
// }