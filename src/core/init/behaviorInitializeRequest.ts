import { system } from "@minecraft/server";

export class BehaviorInitializeRequest {
    static sendRequest(): void {
        system.sendScriptEvent("core:initializeRequest", "");
    }
}