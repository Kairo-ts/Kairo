import type { SystemManager } from "./SystemManager";

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
