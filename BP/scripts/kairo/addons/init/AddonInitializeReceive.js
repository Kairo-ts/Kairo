import { SCRIPT_EVENT_IDS } from "../../constants";
import { ScoreboardManager } from "../../../utils/scoreboardManager";
/**
 * 各アドオンが、ルーターからのリクエストを受け取るためのクラス
 * 受け取った initializeRequest を、そのまま AddonInitializeResponseへ流します
 *
 * A class responsible for receiving requests from the router in each addon.
 * Forwards the received initializeRequest directly to AddonInitializeResponse.
 */
export class AddonInitializeReceive {
    constructor(addonInitializer) {
        this.addonInitializer = addonInitializer;
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
                    this.addonInitializer.unsubscribeClientHooks();
                    break;
            }
        };
    }
    static create(addonInitializer) {
        return new AddonInitializeReceive(addonInitializer);
    }
    handleInitializeRequest() {
        const addonCounter = ScoreboardManager.ensureObjective("AddonCounter");
        addonCounter.addScore("AddonCounter", 1);
        this.addonInitializer.setRegistrationNum(addonCounter.getScore("AddonCounter") ?? 0);
        this.addonInitializer.sendResponse();
    }
    handleRequestReseedId(message) {
        const registrationNum = this.addonInitializer.getRegistrationNum();
        if (message !== registrationNum.toString())
            return;
        this.addonInitializer.refreshSessionId();
        this.addonInitializer.sendResponse();
    }
}
