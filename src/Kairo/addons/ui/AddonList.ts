import { ActionFormData } from "@minecraft/server-ui";
import type { AddonManager } from "../AddonManager";
import type { Player } from "@minecraft/server";

export class AddonList {
    private constructor(private readonly addonManager: AddonManager) {}
    public static create(addonManager: AddonManager): AddonList {
        return new AddonList(addonManager);
    }

    public showAddonList(player: Player): void {
        const addonsData = this.addonManager.getAddonsData();

        const addonListForm = new ActionFormData();
        addonListForm.title({"rawtext": [{ translate: "kairo.addonList.title" }]});

        addonsData.forEach((data, name) => {
            addonListForm.button({"rawtext": [{ text: name }]});
        });

        addonListForm.show(player);
    }
}