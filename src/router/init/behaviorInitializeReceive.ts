import type { ScriptEventCommandMessageAfterEvent } from "@minecraft/server";
import { BehaviorInitializeResponse } from "./behaviorInitializeResponse";

export class BehaviorInitializeReceive {
    private static forwardRequest(): void {
        BehaviorInitializeResponse.sendResponse();
    }

    static handleScriptEventReceive(ev: ScriptEventCommandMessageAfterEvent): void {
        const { id, message } = ev;

        if (id !== "router:initializeRequest") return;
        this.forwardRequest();
    }
}