import { system, type ScriptEventCommandMessageAfterEvent } from "@minecraft/server";
import type { AddonManager } from "../AddonManager";
import { SCRIPT_EVENT_ID_PREFIX } from "../../../constants/scriptevent";

export class AddonRouter {
    private constructor(private readonly addonManager: AddonManager) {}
    
    public static create(addonManager: AddonManager): AddonRouter {
        return new AddonRouter(addonManager);
    }

    public handleScriptEvent(ev: ScriptEventCommandMessageAfterEvent): void {
        const { id, message } = ev;
        const idSuffix = id.split(":")[1];
        if (idSuffix === undefined) return;

        const addonData = this.addonManager.getAddonsData().get(idSuffix);
        if (addonData === undefined) return;
        if (!addonData.isActive) return;

        const activeVersionData = addonData.versions[addonData.activeVersion];
        if (!activeVersionData) return;

        system.sendScriptEvent(`${SCRIPT_EVENT_ID_PREFIX.KAIRO}:${activeVersionData.sessionId}`, message);
    }
}