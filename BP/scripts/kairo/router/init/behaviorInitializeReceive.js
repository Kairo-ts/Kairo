import { world } from "@minecraft/server";
/**
 * 各アドオンが、ルーターからのリクエストを受け取るためのクラス
 * 受け取った initializeRequest を、そのまま BehaviorInitializeResponseへ流します
 *
 * A class responsible for receiving requests from the router in each addon.
 * Forwards the received initializeRequest directly to BehaviorInitializeResponse.
 */
export class BehaviorInitializeReceive {
    constructor(addonRouter) {
        this.addonRouter = addonRouter;
        this.handleScriptEvent = (ev) => {
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
        };
    }
    static create(addonRouter) {
        return new BehaviorInitializeReceive(addonRouter);
    }
    handleInitializeRequest() {
        world.scoreboard.getObjective("AddonCounter")?.addScore("AddonCounter", 1);
        this.addonRouter.sendResponse();
    }
    handleRequestReseedId(message) {
        const selfSessionId = this.addonRouter.getSelfAddonProperty().sessionId;
        if (message !== selfSessionId)
            return;
        this.addonRouter.refreshSessionId();
        this.addonRouter.sendResponse();
    }
}
