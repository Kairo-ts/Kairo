import { world } from "@minecraft/server";
import type { SystemManager } from "./SystemManager";
import { KairoUtils } from "../utils/KairoUtils";
import { KAIRO_DATAVAULT_KEYS } from "../constants/system";
import { PlayerKairoData } from "./PlayerKairoData";

export type PlayerKairoState = string & { __brand: "PlayerKairoState" };

export interface PlayerKairoDataSerialized {
    playerId: string;
    states: PlayerKairoState[];
}

export class PlayerKairoDataManager {
    private playersKairoData = new Map<string, PlayerKairoData>();
    private validStates = new Set<string>();
    private joinOrder = 0;

    private constructor(
        private readonly systemManager: SystemManager,
        initialStates: string[] = [],
    ) {
        for (const s of initialStates) {
            this.registerState(s);
        }
    }

    public static create(
        systemManager: SystemManager,
        initialStates: string[],
    ): PlayerKairoDataManager {
        return new PlayerKairoDataManager(systemManager, initialStates);
    }

    public async init(): Promise<void> {
        KairoUtils.loadFromDataVault(KAIRO_DATAVAULT_KEYS.KAIRO_PLAYERS_DATA);

        const dataLoaded = await this.systemManager.waitForDataVaultNewDataLoaded(
            KAIRO_DATAVAULT_KEYS.KAIRO_PLAYERS_DATA,
        );

        if (dataLoaded.value !== "string") return;

        const playersDataSerialized = JSON.parse(dataLoaded.value) as PlayerKairoDataSerialized[];
        const playersDataSerializedMap = new Map<string, PlayerKairoDataSerialized>(
            playersDataSerialized.map((item) => [item.playerId, item]),
        );

        const players = world.getPlayers();
        for (const player of players) {
            const playerDataSerialized = playersDataSerializedMap.get(player.id);
            const initialStates =
                playerDataSerialized !== undefined ? playerDataSerialized.states : [];

            const playerKairoData = new PlayerKairoData(this, this.joinOrder++, initialStates);
            this.playersKairoData.set(player.id, playerKairoData);
        }

        this.savePlayersKairoDataToDataVault();
    }

    public savePlayersKairoDataToDataVault(): void {
        const serialized: PlayerKairoDataSerialized[] = Array.from(
            this.playersKairoData,
            ([playerId, kairoData]) => ({
                playerId,
                states: [...kairoData.getStates()],
            }),
        );

        const json = JSON.stringify(serialized);
        KairoUtils.saveToDataVault(KAIRO_DATAVAULT_KEYS.KAIRO_PLAYERS_DATA, json);
    }

    public registerState(state: string): PlayerKairoState {
        this.validStates.add(state);
        return state as PlayerKairoState;
    }

    public validateOrThrow(state: string): PlayerKairoState {
        if (!this.validStates.has(state)) {
            throw new Error(`State "${state}" is not registered in PlayerKairoDataManager.`);
        }
        return state as PlayerKairoState;
    }

    public has(state: string): state is PlayerKairoState {
        return this.validStates.has(state);
    }

    public getAll(): PlayerKairoState[] {
        return [...this.validStates] as PlayerKairoState[];
    }
}
