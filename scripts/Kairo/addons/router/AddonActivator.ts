import { Player, system, world } from "@minecraft/server";
import type { AddonData, AddonManager } from "../AddonManager";
import { SCRIPT_EVENT_ID_PREFIX, SCRIPT_EVENT_MESSAGES } from "../../../constants/scriptevent";
import { KAIRO_TRANSLATE_IDS } from "../../../constants/translate";
import { AddonRequireValidator } from "./AddonRequireValidator";

export class AddonActivator {
    private readonly addonRequireValidator: AddonRequireValidator;

    private constructor(private readonly addonManager: AddonManager) {
        this.addonRequireValidator = AddonRequireValidator.create(this);
    }

    public static create(addonManager: AddonManager): AddonActivator {
        return new AddonActivator(addonManager);
    }

    public activateAddon(player: Player, addonData: AddonData, version: string): void {
        world.sendMessage({ translate: KAIRO_TRANSLATE_IDS.ADDON_ACTIVE, with: [addonData.name, version]});
    }

    public async deactivateAddon(player: Player, addonData: AddonData): Promise<void> {
        const deactivateAddonIds = await this.addonRequireValidator.validateRequiredAddonsForDeactivation(player, addonData);

        const addonsData = this.getAddonsData();
        for (const id of deactivateAddonIds) {
            const data = addonsData.get(id);
            if (data) {
                data.isActive = false;

                const activeVersionData = data.versions[data.activeVersion];
                const sessionId = activeVersionData?.sessionId;
                if (sessionId) this.sendDeactiveRequest(sessionId);

                world.sendMessage({ translate: KAIRO_TRANSLATE_IDS.ADDON_DEACTIVE, with: [data.name]});
            }
        }
    }

    public getAddonsData(): Map<string, AddonData> {
        return this.addonManager.getAddonsData();
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