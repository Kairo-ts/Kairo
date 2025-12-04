import { world } from "@minecraft/server";
import type { SystemManager } from "./SystemManager";
import { KairoUtils } from "../utils/KairoUtils";
import { KAIRO_DATAVAULT_KEYS } from "../constants/system";

export type PlayerKairoState = string & { __brand: "PlayerKairoState" };

export class PlayerKairoDataManager {
    private validStates = new Set<string>();

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

        const players = world.getPlayers();
        for (const player of players) {
        }
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
