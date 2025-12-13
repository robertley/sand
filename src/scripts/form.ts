import { GAME_STATE } from "..";

const SPS_INPUT = document.getElementById('spsInput') as HTMLInputElement;
const PORTAL_SPAWN_RATE_INPUT = document.getElementById('portalSpawnRateInput') as HTMLInputElement;

export function formInit() {
    SPS_INPUT.value = GAME_STATE.sandPerSecond.toString();
    PORTAL_SPAWN_RATE_INPUT.value = GAME_STATE.sandPortalRate.toString();
}

SPS_INPUT.onchange = function () {
    const newSPS = parseInt(SPS_INPUT.value);
    if (!isNaN(newSPS) && newSPS > 0) {
        console.log('setting sps to', newSPS);
        GAME_STATE.sandPerSecond = newSPS;
    } else {
        SPS_INPUT.value = GAME_STATE.sandPerSecond.toString();
    }
}

PORTAL_SPAWN_RATE_INPUT.onchange = function () {
    const newRate = parseInt(PORTAL_SPAWN_RATE_INPUT.value);
    if (!isNaN(newRate) && newRate > 0) {
        GAME_STATE.sandPortalRate = newRate;
    } else {
        PORTAL_SPAWN_RATE_INPUT.value = GAME_STATE.sandPortalRate.toString();
    }
}