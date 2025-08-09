import { world, type ScriptEventCommandMessageAfterEvent } from "@minecraft/server";
import type { AddonRouter } from "../../AddonRouter";

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

    public handleScriptEvent = (ev: ScriptEventCommandMessageAfterEvent): void => {
        const { id, message } = ev;

        switch (id) {
            case "kairo:initializeRequest":
                this.handleInitializeRequest();
                break;
            case "kairo:requestReseedId":
                this.handleRequestReseedId(message);
                break;
            case "kairo:unsubscribeInitialize":
                this.addonRouter.unsubscribeClientHooks();
                break;
        }
    }

    private handleInitializeRequest(): void {
        world.scoreboard.getObjective("AddonCounter")?.addScore("AddonCounter", 1);
        this.addonRouter.sendResponse();
    }

    private handleRequestReseedId(message: string): void {
        const selfSessionId = this.addonRouter.getSelfAddonProperty().sessionId;
        if (message !== selfSessionId) return;

        this.addonRouter.refreshSessionId();
        this.addonRouter.sendResponse();
    }
}