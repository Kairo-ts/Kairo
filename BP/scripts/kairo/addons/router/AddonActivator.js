import { system } from "@minecraft/server";
import { SCRIPT_EVENT_ID_PREFIX, SCRIPT_EVENT_MESSAGES } from "../../../constants/scriptevent";
export class AddonActivator {
    constructor(addonManager) {
        this.addonManager = addonManager;
    }
    static create(addonManager) {
        return new AddonActivator(addonManager);
    }
    changeAddonSettings(addonData, version, isActive) {
        addonData.selectedVersion = version;
        addonData.isActive = isActive;
        const activeVersionData = addonData.versions[addonData.activeVersion];
        const sessionId = activeVersionData?.sessionId;
        if (!sessionId)
            return;
        if (addonData.isActive)
            this.sendActiveRequest(sessionId);
        else
            this.sendDeactiveRequest(sessionId);
    }
    sendActiveRequest(sessionId) {
        system.sendScriptEvent(`${SCRIPT_EVENT_ID_PREFIX.KAIRO}:${sessionId}`, SCRIPT_EVENT_MESSAGES.ACTIVATE_REQUEST);
    }
    sendDeactiveRequest(sessionId) {
        system.sendScriptEvent(`${SCRIPT_EVENT_ID_PREFIX.KAIRO}:${sessionId}`, SCRIPT_EVENT_MESSAGES.DEACTIVATE_REQUEST);
    }
}
