import { SCRIPT_EVENT_ID_PREFIX, SCRIPT_EVENT_MESSAGES } from "../../constants/scriptevent";
import { ConsoleManager } from "../../utils/ConsoleManager";
export class AddonReceiver {
    constructor(addonManager) {
        this.addonManager = addonManager;
        this.handleScriptEvent = (ev) => {
            const { id, message } = ev;
            const addonProperty = this.addonManager.getSelfAddonProperty();
            if (id !== `${SCRIPT_EVENT_ID_PREFIX.KAIRO}:${addonProperty.sessionId}`)
                return;
            if (this.addonManager.isActive === false) {
                if (message !== SCRIPT_EVENT_MESSAGES.ACTIVATE_REQUEST)
                    return;
            }
            switch (message) {
                case SCRIPT_EVENT_MESSAGES.ACTIVATE_REQUEST:
                    this.addonManager._activateAddon();
                    break;
                case SCRIPT_EVENT_MESSAGES.DEACTIVATE_REQUEST:
                    this.addonManager._deactivateAddon();
                    break;
                default:
                    let data;
                    try {
                        data = JSON.parse(message);
                    }
                    catch (e) {
                        ConsoleManager.warn(`[ScriptEventReceiver] Invalid JSON: ${message}`);
                        return;
                    }
                    if (!data || typeof data !== "object")
                        return;
                    if (typeof data.commandId !== "string")
                        return;
                    if (typeof data.addonId !== "string")
                        return;
                    const command = data;
                    this.addonManager._scriptEvent(command);
                    break;
            }
        };
    }
    static create(addonManager) {
        return new AddonReceiver(addonManager);
    }
}
