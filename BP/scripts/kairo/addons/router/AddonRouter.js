import { system } from "@minecraft/server";
import { SCRIPT_EVENT_ID_PREFIX } from "../../constants/scriptevent";
export class AddonRouter {
    constructor(addonManager) {
        this.addonManager = addonManager;
    }
    static create(addonManager) {
        return new AddonRouter(addonManager);
    }
    handleScriptEvent(ev) {
        const { id, message } = ev;
        const idSuffix = id.split(":")[1];
        if (idSuffix === undefined)
            return;
        const addonData = this.addonManager.getAddonsData().get(idSuffix);
        if (addonData === undefined)
            return;
        if (!addonData.isActive)
            return;
        const activeVersionData = addonData.versions[addonData.activeVersion];
        if (!activeVersionData)
            return;
        system.sendScriptEvent(`${SCRIPT_EVENT_ID_PREFIX.KAIRO}:${activeVersionData.sessionId}`, message);
    }
}
