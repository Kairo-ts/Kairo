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
            const isActive = data.isActive ? `§l§9有効§r` : `§l§4無効§r`;
            addonListForm.button(`§l§8${name}§r\n${isActive} §8(${data.selectedVersion})§r`);
        });

        const { selection, canceled: listFormCanceled } = await addonListForm.show(player);
        if (listFormCanceled || selection === undefined) return;

        const selectedAddon = addonsData[selection];
        if (!selectedAddon) return;

        const addonDataForm = new ModalFormData();
        const entries = Object.entries(selectedAddon[1].versions);
        const versionList = entries.map(
            ([version, data]) => {
                return data.isRegistered ? `§f${version}§r` : `§7${version}§r`;
            }
        );

        const selectableVersions = [
            "latest version", 
            ...entries
                .filter(([version, data]) => data.isRegistered)
                .map(([version]) => version)
        ];
        const selectedVersionIndex = selectableVersions.indexOf(selectedAddon[1].selectedVersion);

        addonDataForm
            .title(selectedAddon[0])
            .label("バージョン一覧\n" + versionList.join("\n"))
            .dropdown("バージョン選択", selectableVersions, { defaultValueIndex: selectedVersionIndex })
            .toggle("有効化", { defaultValue:selectedAddon[1].isActive });

        const { formValues, canceled: dataFormCanceled } = await addonDataForm.show(player);
        if (dataFormCanceled || formValues === undefined) return;

        const versionIndex = Number(formValues[1]);
        const selectedVersion = selectableVersions[versionIndex];
        if (selectedVersion === undefined) return;
        selectedAddon[1].selectedVersion = selectedVersion;

        selectedAddon[1].isActive = formValues[2] as boolean;
    }
}