import { world, type Player } from "@minecraft/server";
import type { AddonData, AddonManager } from "../AddonManager";
import { KAIRO_TRANSLATE_IDS } from "../../../constants/translate";

export class AddonVersionChanger {
    private constructor(private readonly addonManager: AddonManager) {}

    public static create(addonManager: AddonManager): AddonVersionChanger {
        return new AddonVersionChanger(addonManager);
    }

    public changeAddonVersion(player: Player, addonData: AddonData, version: string): void {
        world.sendMessage({ translate: KAIRO_TRANSLATE_IDS.ADDON_CHANGE_VERSION, with: [addonData.name, version]});
    }
}