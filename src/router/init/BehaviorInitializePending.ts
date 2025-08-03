import type { ScriptEventCommandMessageAfterEvent } from "@minecraft/server";

export class BehaviorInitializePending {
    private static readonly pendingAddons: Set<string> = new Set();

    static handleScriptEventReceive(ev: ScriptEventCommandMessageAfterEvent): void {
        const { id, message } = ev;

        if (id !== "router:initializeResponse") return;
        this.add(message);
    }

    private static add(message: string): void {
        this.pendingAddons.add(message);
    }
}