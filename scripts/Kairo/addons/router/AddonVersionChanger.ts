import type { Player } from "@minecraft/server";
import type { AddonData, AddonManager } from "../AddonManager";

export class AddonVersionChanger {
    private constructor(private readonly addonManager: AddonManager) {}

    private static create(addonManager: AddonManager): AddonVersionChanger {
        return new AddonVersionChanger(addonManager);
    }

    public changeAddonVersion(player: Player, addonData: AddonData, version: string): void {
        this.addonManager.changeAddonVersion(player, addonData, version);
    }
}