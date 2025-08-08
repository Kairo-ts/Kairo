import { world, type ScriptEventCommandMessageAfterEvent } from "@minecraft/server";
import { BehaviorInitializeResponse } from "./behaviorInitializeResponse";
import { AddonPropertyManager } from "../../AddonProperty";
import type { AddonRouter } from "../AddonRouter";

/**
 * 各アドオンが、ルーターからのリクエストを受け取るためのクラス
 * 受け取った initializeRequest を、そのまま BehaviorInitializeResponseへ流します
 * 
 * A class responsible for receiving requests from the router in each addon.
 * Forwards the received initializeRequest directly to BehaviorInitializeResponse.
 */
export class BehaviorInitializeReceive {
    private constructor(private readonly addonRouter: AddonRouter) {}

    public static create(addonRouter: AddonRouter): BehaviorInitializeReceive {
        return new BehaviorInitializeReceive(addonRouter);
    }

    public handleScriptEventReceive(ev: ScriptEventCommandMessageAfterEvent): void {
        const { id, message } = ev;

        if (id === "router:requestReseedId") {
            this.handleReseedRequest(message);
            return;
        }

        if (id === "router:initializeRequest") {
            this.handleInitializeRequest();
            return;
        }
    }

    private handleReseedRequest(message: string): void {
        if (message !== AddonPropertyManager.getSelfAddonProperty().sessionId) return;

        AddonPropertyManager.refreshSessionId();
        BehaviorInitializeResponse.sendResponse();
    }

    private handleInitializeRequest(): void {
        world.scoreboard.getObjective("AddonCounter")?.addScore("AddonCounter", 1);
        BehaviorInitializeResponse.sendResponse();
    }
}