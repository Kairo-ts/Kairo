import {} from "@minecraft/server";
import { AddonRequireValidatorForDeactivation } from "./AddonRequireValidatorForDeactivation";
import { AddonRequireValidatorForActivation } from "./AddonRequireValidatorForActivation";
export class AddonRequireValidator {
    constructor(addonActivator) {
        this.addonActivator = addonActivator;
        this.forActivation = AddonRequireValidatorForActivation.create(this);
        this.forDeactivation = AddonRequireValidatorForDeactivation.create(this);
    }
    static create(addonActivator) {
        return new AddonRequireValidator(addonActivator);
    }
    async validateRequiredAddonsForActivation(player, addonData, newVersion) {
        return this.forActivation.validateRequiredAddonsForActivation(player, addonData, newVersion);
    }
    async validateRequiredAddonsForDeactivation(player, addonData, newVersion = addonData.activeVersion) {
        return this.forDeactivation.validateRequiredAddonsForDeactivation(player, addonData, newVersion);
    }
    async validateRequiredAddons(player, addonData, newVersion, isActive) {
        /**
         * 有効にする場合は、前提アドオンも有効にする必要がある
         * 無効にする場合は、自身が依存されているかどうかを調べ、依存されていれば、そのアドオンも無効化する
         */
        if (isActive)
            this.forActivation.validateRequiredAddonsForActivation(player, addonData, newVersion);
        else
            this.forDeactivation.validateRequiredAddonsForDeactivation(player, addonData);
    }
    getAddonsData() {
        return this.addonActivator.getAddonsData();
    }
    getLatestPreferStableVersion(id) {
        return this.addonActivator.getLatestPreferStableVersion(id);
    }
    getLatestVersion(id) {
        return this.addonActivator.getLatestVersion(id);
    }
}
