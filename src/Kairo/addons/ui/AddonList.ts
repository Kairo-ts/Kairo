import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import type { AddonManager } from "../AddonManager";
import type { Player } from "@minecraft/server";

export class AddonList {
    private constructor(private readonly addonManager: AddonManager) {}
    public static create(addonManager: AddonManager): AddonList {
        return new AddonList(addonManager);
    }

    public async showAddonList(player: Player): Promise<void> {
        const addonsData = Array.from(this.addonManager.getAddonsData());

        const addonListForm = new ActionFormData();
        addonListForm.title({"rawtext": [{ translate: "kairo.addonList.title" }]});

        addonsData.forEach(([name, data]) => {
            if (data.isActive) {
                addonListForm.button(`§l§8${name}§r\n§l§9有効`);
            }
            else {
                addonListForm.button(`§l§8${name}§r\n§l§4無効`);
            }
        });

        const { selection, canceled: listFormCanceled } = await addonListForm.show(player);
        if (listFormCanceled || selection === undefined) return;

        const selectedAddon = addonsData[selection];
        if (!selectedAddon) return;

        const addonDataForm = new ModalFormData();
        addonDataForm.title(selectedAddon[0]);

        const { formValues, canceled: dataFormCanceled } = await addonDataForm.show(player);
        if (dataFormCanceled) return;
    }
}