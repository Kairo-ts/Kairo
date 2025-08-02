import { system, type ScriptEventCommandMessageAfterEvent } from "@minecraft/server";

export class BehaviorManager {
    private static handleScriptEventReceive(ev: ScriptEventCommandMessageAfterEvent): void {
        const { id, message } = ev;

        if (id !== "core:initializeRequest") return;
    }

    static initialize() {
        system.afterEvents.scriptEventReceive.subscribe(this.handleScriptEventReceive);
    }
}