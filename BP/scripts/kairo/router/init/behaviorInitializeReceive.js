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
    }
    static create(addonRouter) {
        return new BehaviorInitializeReceive(addonRouter);
    }
    handleScriptEvent(ev) {
        const { id, message } = ev;
        switch (id) {
            case "kairo:initializeRequest":
                this.handleInitializeRequest();
                break;
            case "kairo:requestReseedId":
                this.handleRequestReseedId(message);
                break;
        }
    }
    handleInitializeRequest() {
        world.scoreboard.getObjective("AddonCounter")?.addScore("AddonCounter", 1);
        this.addonRouter.requestSendResponse();
    }
    handleRequestReseedId(message) {
        const selfSessionId = this.addonRouter.requestGetSelfAddonProperty().sessionId;
        if (message !== selfSessionId)
            return;
        this.addonRouter.requestRefreshSessionId();
        this.addonRouter.requestSendResponse();
    }
}
