import { Player, world } from "@minecraft/server";
import { KairoUtils } from "../utils/KairoUtils";
import { KAIRO_DATAVAULT_KEYS } from "../constants/system";
import { PlayerKairoData } from "./PlayerKairoData";
export class PlayerKairoDataManager {
    constructor(systemManager, initialStates = []) {
        this.systemManager = systemManager;
        this.playersKairoData = new Map();
        this.lastSavedPlayersKairoData = new Map();
        this.validStates = new Set();
        this.joinOrder = 0;
        for (const s of initialStates) {
            this.registerState(s);
        }
    }
    static create(systemManager, initialStates) {
        return new PlayerKairoDataManager(systemManager, initialStates);
    }
    async init() {
        KairoUtils.loadFromDataVault(KAIRO_DATAVAULT_KEYS.KAIRO_PLAYERS_DATA);
        const dataLoaded = await KairoUtils.loadFromDataVault(KAIRO_DATAVAULT_KEYS.KAIRO_PLAYERS_DATA);
        let playersDataSerializedMap = new Map();
        if (typeof dataLoaded === "string" && dataLoaded.length > 0) {
            try {
                const playersDataSerialized = JSON.parse(dataLoaded);
                playersDataSerializedMap = new Map(playersDataSerialized.map((item) => [item.playerId, item]));
            }
            catch {
                playersDataSerializedMap = new Map();
            }
        }
        const players = world.getPlayers();
        for (const player of players) {
            const playerDataSerialized = playersDataSerializedMap.get(player.id);
            const initialStates = playerDataSerialized !== undefined ? playerDataSerialized.states : [];
            const playerKairoData = new PlayerKairoData(this, this.joinOrder++, initialStates);
            this.playersKairoData.set(player.id, playerKairoData);
        }
        this.savePlayersKairoDataToDataVault();
    }
    addOrRestorePlayerKairoData(player) {
        const existing = this.playersKairoData.get(player.id);
        if (existing) {
            existing.setJoinOrder(this.joinOrder++);
            this.savePlayersKairoDataToDataVault();
            return;
        }
        const past = this.lastSavedPlayersKairoData.get(player.id);
        let initialStates = [];
        if (past) {
            initialStates = past.states ?? [];
        }
        const playerData = new PlayerKairoData(this, this.joinOrder++, initialStates);
        this.playersKairoData.set(player.id, playerData);
        this.savePlayersKairoDataToDataVault();
    }
    savePlayersKairoDataToDataVault() {
        const serialized = Array.from(this.playersKairoData, ([playerId, kairoData]) => ({
            playerId,
            states: [...kairoData.getStates()],
        }));
        this.lastSavedPlayersKairoData = new Map(serialized.map((item) => [item.playerId, item]));
        const json = JSON.stringify(serialized);
        KairoUtils.saveToDataVault(KAIRO_DATAVAULT_KEYS.KAIRO_PLAYERS_DATA, json);
    }
    registerState(state) {
        this.validStates.add(state);
        return state;
    }
    validateOrThrow(state) {
        if (!this.validStates.has(state)) {
            throw new Error(`State "${state}" is not registered in PlayerKairoDataManager.`);
        }
        return state;
    }
    hasState(state) {
        return this.validStates.has(state);
    }
    getAllStates() {
        return [...this.validStates];
    }
    getPlayerKairoData(playerId) {
        return this.playersKairoData.get(playerId);
    }
    getPlayersKairoData() {
        return this.playersKairoData;
    }
}
