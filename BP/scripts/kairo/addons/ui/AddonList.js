import { ActionFormData } from "@minecraft/server-ui";
export class AddonList {
    constructor(addonManager) {
        this.addonManager = addonManager;
    }
    static create(addonManager) {
        return new AddonList(addonManager);
    }
    showAddonList(player) {
        const addonsData = this.addonManager.getAddonsData();
        const addonListForm = new ActionFormData();
        addonListForm.title({ "rawtext": [{ translate: "kairo.addonList.title" }] });
        addonsData.forEach((data, name) => {
            addonListForm.button({ "rawtext": [{ text: name }] });
        });
        addonListForm.show(player);
    }
}
