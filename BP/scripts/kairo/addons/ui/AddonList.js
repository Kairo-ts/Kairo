import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
export class AddonList {
    constructor(addonManager) {
        this.addonManager = addonManager;
    }
    static create(addonManager) {
        return new AddonList(addonManager);
    }
    async showAddonList(player) {
        const addonsData = Array.from(this.addonManager.getAddonsData());
        const addonListForm = new ActionFormData();
        addonListForm.title({ "rawtext": [{ translate: "kairo.addonList.title" }] });
        addonsData.forEach(([name, data]) => {
            const isActive = data.isActive ? `§l§9有効§r` : `§l§4無効§r`;
            addonListForm.button(`§l§8${name}§r\n${isActive} §8(${data.selectedVersion})§r`);
        });
        const { selection, canceled: listFormCanceled } = await addonListForm.show(player);
        if (listFormCanceled || selection === undefined)
            return;
        const selectedAddon = addonsData[selection];
        if (!selectedAddon)
            return;
        const addonDataForm = new ModalFormData();
        const entries = Object.entries(selectedAddon[1].versions);
        const versionList = entries.map(([version, data]) => {
            return data.isRegistered
                ? version === selectedAddon[1].activeVersion
                    ? `§f${version}§r` + " §9(§oactive§r§9)§r"
                    : `§f${version}§r`
                : `§7${version} (§ouninstalled§r)`;
        });
        const selectableVersions = [
            "latest version",
            ...entries
                .filter(([version, data]) => data.isRegistered)
                .map(([version]) => version)
        ];
        const selectedVersionIndex = selectableVersions.indexOf(selectedAddon[1].selectedVersion);
        const isActive = selectedAddon[1].isActive ? "§l§9有効§r" : "§l§4無効§r";
        const selectedVersion = selectedAddon[1].selectedVersion === "latest version"
            ? "latest version" + ` (ver.${selectedAddon[1].activeVersion})`
            : `ver.${selectedAddon[1].selectedVersion}`;
        const activeVersionTags = selectedAddon[1].versions[selectedAddon[1].activeVersion]?.tags || [];
        addonDataForm
            .title(selectedAddon[0])
            .header(selectedAddon[0])
            .label(`${selectedAddon[1].description[1]}`)
            .label(isActive + " §7|§r " + selectedVersion + "\n" + activeVersionTags.join(", "))
            .divider()
            .label("§l登録済みバージョン一覧§r\n" + versionList.join("\n"))
            .divider()
            .dropdown("バージョン選択", selectableVersions, { defaultValueIndex: selectedVersionIndex })
            .toggle("有効化", { defaultValue: selectedAddon[1].isActive })
            .submitButton("変更を送信");
        const { formValues, canceled: dataFormCanceled } = await addonDataForm.show(player);
        if (dataFormCanceled || formValues === undefined)
            return;
        const versionIndex = Number(formValues[6]);
        const newSelectedVersion = selectableVersions[versionIndex];
        if (newSelectedVersion === undefined)
            return;
        selectedAddon[1].selectedVersion = newSelectedVersion;
        selectedAddon[1].isActive = formValues[7];
    }
}
