import { world } from "@minecraft/server";
import { KAIRO_TRANSLATE_IDS } from "../../../constants/translate";
export class AddonVersionChanger {
    constructor(addonManager) {
        this.addonManager = addonManager;
    }
    static create(addonManager) {
        return new AddonVersionChanger(addonManager);
    }
    changeAddonVersion(player, addonData, version) {
        world.sendMessage({ translate: KAIRO_TRANSLATE_IDS.ADDON_CHANGE_VERSION, with: [addonData.name, version] });
    }
}
