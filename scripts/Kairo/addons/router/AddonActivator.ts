import { Player, system } from "@minecraft/server";
import type { AddonData, AddonManager } from "../AddonManager";
import { SCRIPT_EVENT_ID_PREFIX, SCRIPT_EVENT_MESSAGES } from "../../../constants/scriptevent";

export class AddonActivator {
    private constructor(private readonly addonManager: AddonManager) {}

    public static create(addonManager: AddonManager): AddonActivator {
        return new AddonActivator(addonManager);
    }

    public activeAddon(player: Player, addonData: AddonData, version: string): void {

    }

    public deactiveAddon(player: Player, addonData: AddonData): void {
        
    }

    public changeAddonSettings(addonData: AddonData, version: string, isActive: boolean): void {
        addonData.selectedVersion = version;
        addonData.isActive = isActive;

        const activeVersionData = addonData.versions[addonData.activeVersion];
        const sessionId = activeVersionData?.sessionId;
        if (!sessionId) return;

        if (addonData.isActive) this.sendActiveRequest(sessionId);
        else this.sendDeactiveRequest(sessionId);
    }

    public sendActiveRequest(sessionId: string): void {
        system.sendScriptEvent(`${SCRIPT_EVENT_ID_PREFIX.KAIRO}:${sessionId}`, SCRIPT_EVENT_MESSAGES.ACTIVATE_REQUEST);
    }

    public sendDeactiveRequest(sessionId: string): void {
        system.sendScriptEvent(`${SCRIPT_EVENT_ID_PREFIX.KAIRO}:${sessionId}`, SCRIPT_EVENT_MESSAGES.DEACTIVATE_REQUEST);
    }
}