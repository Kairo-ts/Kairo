import {} from "@minecraft/server";
import { AddonRequireValidatorForDeactivation } from "./AddonRequireValidatorForDeactivation";
import { AddonRequireValidatorForActivation } from "./AddonRequireValidatorForActivation";
import { VersionManager } from "../../../utils/VersionManager";
export class AddonRequireValidator {
    constructor(addonManager) {
        this.addonManager = addonManager;
        this.forActivation = AddonRequireValidatorForActivation.create(this);
        this.forDeactivation = AddonRequireValidatorForDeactivation.create(this);
    }
    static create(addonManager) {
        return new AddonRequireValidator(addonManager);
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
        return this.addonManager.getAddonsData();
    }
    changeAddonSettings(addonData, version, isActive) {
        this.addonManager.changeAddonSettings(addonData, version, isActive);
    }
    getLatestPreferStableVersion(id) {
        return this.addonManager.getLatestPreferStableVersion(id);
    }
    getLatestVersion(id) {
        return this.addonManager.getLatestVersion(id);
    }
}
