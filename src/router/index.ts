import type { ScriptEventCommandMessageAfterEvent, WorldLoadAfterEvent } from "@minecraft/server";
import { system, world } from "@minecraft/server";
import { BehaviorInitializeRegister } from "./init/behaviorInitializeRegister";
import { BehaviorInitializeRequest } from "./init/behaviorInitializeRequest";
import { ConsoleManager } from "../utils/consoleManager";

export class Core {
    private static handleWorldLoad(ev: WorldLoadAfterEvent): void {
        ConsoleManager.info("Core", "World loaded. Sending core initialization request...");
        BehaviorInitializeRequest.sendRequest();
    }

    private static handleScriptEventReceive(ev: ScriptEventCommandMessageAfterEvent): void {
        const { id, message } = ev;

        if (id !== "core:initializeResponse") return;
        BehaviorInitializeRegister.registerAddon(message);
    }

    static initialize() {
        world.afterEvents.worldLoad.subscribe(this.handleWorldLoad);
        system.afterEvents.scriptEventReceive.subscribe(this.handleScriptEventReceive);
    }
}