import type { ScriptEventCommandMessageAfterEvent } from "@minecraft/server";
import { ConsoleManager } from "../../utils/consoleManager";

export class BehaviorInitializeRegister {
    static handleScriptEventReceive(ev: ScriptEventCommandMessageAfterEvent): void {
        const { id, message} = ev;

        if (id !== "router:initializeResponse") return;
        this.registerAddon(message);
    }

    private static registerAddon(message: string): void {
        const addonProperties = JSON.parse(message);

        ConsoleManager.info("Router", `registerd ${addonProperties.name} ver.${addonProperties.version.join(".")}`);
    }
}