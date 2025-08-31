import type { Player } from "@minecraft/server";
import type { AddonData, AddonManager } from "../AddonManager";

export class AddonVersionChanger {
    private constructor(private readonly addonManager: AddonManager) {}

    public changeAddonVersion(player: Player, addonData: AddonData, version: string): void {
        this.addonManager.changeAddonVersion(player, addonData, version);
    }
}