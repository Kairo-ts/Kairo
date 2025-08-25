import { type Player } from "@minecraft/server";
import type { AddonData, AddonManager } from "../AddonManager";
import { AddonRequireValidatorForDeactivation } from "./AddonRequireValidatorForDeactivation";
import { AddonRequireValidatorForActivation } from "./AddonRequireValidatorForActivation";
import { VersionManager } from "../../../utils/VersionManager";

export class AddonRequireValidator {
    private readonly forActivation: AddonRequireValidatorForActivation;
    private readonly forDeactivation: AddonRequireValidatorForDeactivation;

    private constructor(private readonly addonManager: AddonManager) {
        this.forActivation = AddonRequireValidatorForActivation.create(this);
        this.forDeactivation = AddonRequireValidatorForDeactivation.create(this);
    }
    public static create(addonManager: AddonManager): AddonRequireValidator {
        return new AddonRequireValidator(addonManager);
    }

    public async validateRequiredAddons(player: Player, addonData: AddonData, newVersion: string, isActive: boolean): Promise<void> {
        /**
         * 有効にする場合は、前提アドオンも有効にする必要がある
         * 無効にする場合は、自身が依存されているかどうかを調べ、依存されていれば、そのアドオンも無効化する
         */
        if (isActive) this.forActivation.validateRequiredAddonsForActivation(player, addonData, newVersion);
        else this.forDeactivation.validateRequiredAddonsForDeactivation(player, addonData);
    }

    public getAddonsData(): Map<string, AddonData> {
        return this.addonManager.getAddonsData();
    }

    public changeAddonSettings(addonData: AddonData, version: string, isActive: boolean): void {
        this.addonManager.changeAddonSettings(addonData, version, isActive);
    }

    public getLatestStableVersion(id: string): string | undefined {
         const addonData = this.getAddonsData().get(id);
        if (!addonData) return undefined;

        const sorted = Object.keys(addonData.versions)
            .filter(v => addonData.versions[v]?.isRegistered)
            .sort((a, b) => VersionManager.compare(b, a));

        if (sorted.length === 0) {
            return undefined;
        }

        const stable = sorted.find(v => !VersionManager.fromString(v).prerelease);
        return stable ?? sorted[0]!;
    }

    public getLatestVersion(id: string): string | undefined {
        const addonData = this.getAddonsData().get(id);
        if (!addonData) return undefined;

        const latestVersion = Object.keys(addonData.versions)
            .filter(v => addonData.versions[v]?.isRegistered)
            .sort((a, b) => VersionManager.compare(b, a))[0];

        return latestVersion ?? undefined;
    }
}