import { system, WorldLoadAfterEvent } from "@minecraft/server";
import { ConsoleManager } from "../../utils/consoleManager";

export class BehaviorInitializeRequest {
    private static sendRequest(): void {
        ConsoleManager.info("Core", "World loaded. Sending core initialization request...");
        system.sendScriptEvent("core:initializeRequest", "");
    }

    static handleWorldLoad(ev: WorldLoadAfterEvent): void {
        this.sendRequest();
    }
}