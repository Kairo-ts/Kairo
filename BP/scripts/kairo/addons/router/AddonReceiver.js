import { SCRIPT_EVENT_ID_PREFIX, SCRIPT_EVENT_MESSAGES } from "../../../constants/scriptevent";
export class AddonReceiver {
    constructor(addonManager) {
        this.addonManager = addonManager;
        this.handleScriptEvent = (ev) => {
            const { id, message, sourceEntity } = ev;
            const addonProperty = this.addonManager.getSelfAddonProperty();
            if (id !== `${SCRIPT_EVENT_ID_PREFIX.KAIRO}:${addonProperty.sessionId}`)
                return;
            switch (message) {
                case SCRIPT_EVENT_MESSAGES.ACTIVATE_REQUEST:
                    this.addonManager._activeAddon();
                    break;
                case SCRIPT_EVENT_MESSAGES.DEACTIVATE_REQUEST:
                    this.addonManager._inactiveAddon();
                    break;
            }
        };
    }
    static create(addonManager) {
        return new AddonReceiver(addonManager);
    }
}
