import { fpsCurrent, GAME_STATE, sandLastSecond } from "..";

const SAND_DISPLAY = document.getElementById('sandHeader');
const MOUSE_SAND_PER_SECOND_DISPLAY = document.getElementById('mspsDisplay');
const SAND_MULTIPLIER_DISPLAY = document.getElementById('sandMultiplierDisplay');
const SAND_PER_SECOND_DISPLAY = document.getElementById('spsDisplay');
const FPS_COUNTER = document.getElementById('fpsCounter');

export function updateStatsUI() {
    if (SAND_DISPLAY) {
        SAND_DISPLAY.textContent = `Sand: ${GAME_STATE.sandCount.toFixed(0)}`;
    }
    if (SAND_PER_SECOND_DISPLAY) {
        SAND_PER_SECOND_DISPLAY.textContent = `${sandLastSecond}`;
    }
    if (FPS_COUNTER) {
        FPS_COUNTER.textContent = `${fpsCurrent.toFixed(0)}`;
    }
    if (MOUSE_SAND_PER_SECOND_DISPLAY) {
        MOUSE_SAND_PER_SECOND_DISPLAY.textContent = `${GAME_STATE.mouseDropRate}/s`;
    }
    if (SAND_MULTIPLIER_DISPLAY) {
        SAND_MULTIPLIER_DISPLAY.textContent = `x${GAME_STATE.sandMultiplier?.toFixed(1) ?? 1}`;
    }
}