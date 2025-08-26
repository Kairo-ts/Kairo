import { SCRIPT_EVENT_MESSAGES } from "../../../constants/scriptevent";
export class AddonReceiver {
    constructor(addonManager) {
        this.addonManager = addonManager;
        this.handleScriptEvent = (ev) => {
            const { id, message, sourceEntity } = ev;
            const addonProperty = this.addonManager.getSelfAddonProperty();
            if (id !== `kairo:${addonProperty.sessionId}`)
                return;
            switch (message) {
                case SCRIPT_EVENT_MESSAGES.ACTIVE_REQUEST:
                    this.addonManager.activeAddon();
                    break;
                case SCRIPT_EVENT_MESSAGES.DEACTIVE_REQUEST:
                    this.addonManager.inactiveAddon();
                    break;
            }
        };
    }
    static create(addonManager) {
        return new AddonReceiver(addonManager);
    }
}
