import type { PlayerKairoDataManager, PlayerKairoState } from "./PlayerKairoDataManager";

export class PlayerKairoData {
    private JoinOrder: number = 0;
    private kairoState: Set<PlayerKairoState>;

    private constructor(manager: PlayerKairoDataManager, JoinOrder: number) {
        this.JoinOrder = JoinOrder;
        this.kairoState = new Set();
    }

    public static create(manager: PlayerKairoDataManager, JoinOrder: number): PlayerKairoData {
        return new PlayerKairoData(manager, JoinOrder);
    }

    public getJoinOrder(): number {
        return this.JoinOrder;
    }

    public addState(manager: PlayerKairoDataManager, newState: string): void {
        const validated = manager.validateOrThrow(newState);
        this.kairoState.add(validated);
    }

    public removeState(state: PlayerKairoState): void {
        this.kairoState.delete(state);
    }

    public hasState(state: PlayerKairoState): boolean {
        return this.kairoState.has(state);
    }

    public getStates(): PlayerKairoState[] {
        return [...this.kairoState];
    }

    public clearStates(): void {
        this.kairoState.clear();
    }
}
