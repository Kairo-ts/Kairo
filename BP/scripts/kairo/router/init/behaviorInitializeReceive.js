import { world } from "@minecraft/server";
import { SCRIPT_EVENT_IDS } from "../../constants";
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
                case SCRIPT_EVENT_IDS.BEHAVIOR_INITIALIZE_REQUEST:
                    this.handleInitializeRequest();
                    break;
                case SCRIPT_EVENT_IDS.REQUEST_RESEED_SESSION_ID:
                    this.handleRequestReseedId(message);
                    break;
                case SCRIPT_EVENT_IDS.UNSUBSCRIBE_INITIALIZE:
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
