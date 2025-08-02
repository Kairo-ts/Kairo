import { system, WorldLoadAfterEvent } from "@minecraft/server";
import { ConsoleManager } from "../../utils/consoleManager";

export class BehaviorInitializeRequest {
    static handleWorldLoad(ev: WorldLoadAfterEvent): void {
        this.sendRequest();
    }

    private static sendRequest(): void {
        ConsoleManager.info("Router", "World loaded. Sending core initialization request...");
        system.sendScriptEvent("router:initializeRequest", "");
    }
}