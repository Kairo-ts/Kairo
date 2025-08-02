import { system, WorldLoadAfterEvent } from "@minecraft/server";
import { ConsoleManager } from "../../utils/consoleManager";

export class BehaviorInitializeRequest {
    private static sendRequest(): void {
        ConsoleManager.info("Router", "World loaded. Sending core initialization request...");
        system.sendScriptEvent("router:initializeRequest", "");
    }

    static handleWorldLoad(ev: WorldLoadAfterEvent): void {
        this.sendRequest();
    }
}