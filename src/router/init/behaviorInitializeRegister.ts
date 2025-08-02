import type { ScriptEventCommandMessageAfterEvent } from "@minecraft/server";

export class BehaviorInitializeRegister {
    static handleScriptEventReceive(ev: ScriptEventCommandMessageAfterEvent): void {
        const { id, message} = ev;

        if (id !== "router:initializeResponse") return;
        this.registerAddon(message);
    }

    private static registerAddon(message: string): void {

    }
}