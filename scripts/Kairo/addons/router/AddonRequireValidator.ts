import { type Player } from "@minecraft/server";
import type { AddonData } from "../AddonManager";
import { AddonRequireValidatorForDeactivation } from "./AddonRequireValidatorForDeactivation";
import { AddonRequireValidatorForActivation } from "./AddonRequireValidatorForActivation";
import type { AddonActivator } from "./AddonActivator";

export class AddonRequireValidator {
    private readonly forActivation: AddonRequireValidatorForActivation;
    private readonly forDeactivation: AddonRequireValidatorForDeactivation;

    private constructor(private readonly addonActivator: AddonActivator) {
        this.forActivation = AddonRequireValidatorForActivation.create(this);
        this.forDeactivation = AddonRequireValidatorForDeactivation.create(this);
    }
    public static create(addonActivator: AddonActivator): AddonRequireValidator {
        return new AddonRequireValidator(addonActivator);
    }

    public async validateRequiredAddonsForDeactivation(player: Player, addonData: AddonData): Promise<string[]> {
        return this.forDeactivation.validateRequiredAddonsForDeactivation(player, addonData);
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
        return this.addonActivator.getAddonsData();
    }

    public changeAddonSettings(addonData: AddonData, version: string, isActive: boolean): void {
        this.addonActivator.changeAddonSettings(addonData, version, isActive);
    }

    //public getLatestPreferStableVersion(id: string): string | undefined {
    //    return this.addonActivator.getLatestPreferStableVersion(id);
    //}
//
    //public getLatestVersion(id: string): string | undefined {
    //    return this.addonActivator.getLatestVersion(id);
    //}
}