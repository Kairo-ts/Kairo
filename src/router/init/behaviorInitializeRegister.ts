import type { ScriptEventCommandMessageAfterEvent } from "@minecraft/server";

export class BehaviorInitializeRegister {
    private static registerAddon(message: string): void {

    }

    static handleScriptEventReceive(ev: ScriptEventCommandMessageAfterEvent): void {
        const { id, message} = ev;

        if (id !== "router:initializeResponse") return;
        this.registerAddon(message);
    }
}