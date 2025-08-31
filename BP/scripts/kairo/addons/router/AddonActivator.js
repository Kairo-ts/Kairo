import { Player, system, world } from "@minecraft/server";
import { SCRIPT_EVENT_ID_PREFIX, SCRIPT_EVENT_MESSAGES } from "../../../constants/scriptevent";
import { KAIRO_TRANSLATE_IDS } from "../../../constants/translate";
export class AddonActivator {
    constructor(addonManager) {
        this.addonManager = addonManager;
    }
    static create(addonManager) {
        return new AddonActivator(addonManager);
    }
    activeAddon(player, addonData, version) {
        world.sendMessage({ translate: KAIRO_TRANSLATE_IDS.ADDON_ACTIVE, with: [addonData.name, version] });
    }
    deactiveAddon(player, addonData) {
        world.sendMessage({ translate: KAIRO_TRANSLATE_IDS.ADDON_DEACTIVE, with: [addonData.name] });
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
