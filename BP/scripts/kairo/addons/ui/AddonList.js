import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { SCRIPT_EVENT_IDS } from "../../constants";
import { properties, supportedTags } from "../../../properties";
export class AddonList {
    constructor(addonManager) {
        this.addonManager = addonManager;
        this.handleScriptEvent = (ev) => {
            const { id, message, sourceEntity } = ev;
            if (sourceEntity?.typeId !== "minecraft:player")
                return;
            if (id === SCRIPT_EVENT_IDS.SHOW_ADDON_LIST) {
                this.showAddonList(sourceEntity);
            }
        };
    }
    static create(addonManager) {
        return new AddonList(addonManager);
    }
    async showAddonList(player) {
        const addonsData = Array.from(this.addonManager.getAddonsData());
        const addonListForm = new ActionFormData();
        addonListForm.title({ translate: "kairo.addonList.title" });
        addonsData.forEach(([name, data]) => {
            const isActive = data.isActive ? { translate: "kairo.addonList.active" } : { translate: "kairo.addonList.inactive" };
            addonListForm.button({ rawtext: [{ text: `§l§8${name}§r\n` }, isActive, { text: ` §8(${data.selectedVersion})§r` }] }, `textures/${name}/pack_icon`);
        });
        const { selection, canceled: listFormCanceled } = await addonListForm.show(player);
        if (listFormCanceled || selection === undefined)
            return;
        const selectedAddon = addonsData[selection];
        if (!selectedAddon)
            return;
        this.settingAddonDataForm(player, selectedAddon[1]);
    }
    async settingAddonDataForm(player, addonData) {
        const addonDataForm = new ModalFormData();
        const entries = Object.entries(addonData.versions);
        const selectableVersions = [
            "latest version",
            ...entries
                .filter(([version, data]) => data.isRegistered)
                .map(([version]) => version)
        ];
        const selectedVersionIndex = selectableVersions.indexOf(addonData.selectedVersion);
        const requiredAddons = Object.entries(addonData.versions[addonData.activeVersion]?.requiredAddons || {});
        const requiredAddonsStr = requiredAddons.length > 0
            ? "§l前提アドオン§r\n" + requiredAddons.map(([name, version]) => `§f${name}§r §7- (ver.${version})§r`).join("\n")
            : "§l前提アドオン§r\n§7§oNo addons required§r";
        const isActive = addonData.isActive ? { translate: "kairo.addonList.active" } : { translate: "kairo.addonList.inactive" };
        const selectedVersion = addonData.selectedVersion === "latest version"
            ? "latest version" + ` (ver.${addonData.activeVersion})`
            : `ver.${addonData.selectedVersion}`;
        const activeVersionTags = (addonData.versions[addonData.activeVersion]?.tags || []).flatMap(tag => {
            if (supportedTags.includes(tag)) {
                return { translate: `kairo.tags.${tag}` };
            }
            return { text: tag };
        });
        const versionListRawtext = entries.flatMap(([version, data]) => {
            if (data.isRegistered) {
                if (version === addonData.activeVersion) {
                    return [{ text: `§f${version}§r ` }, { translate: "kairo.addonSetting.active" }, { text: "\n" }];
                }
                else {
                    return [{ text: `§f${version}§r` }, { text: "\n" }];
                }
            }
            else {
                return [{ text: `§7${version}§r ` }, { translate: "kairo.addonSetting.uninstalled" }, { text: "\n" }];
            }
        });
        const addonDataRawtexts = {
            name: { translate: `${properties.id}.name` },
            description: { translate: `${properties.id}.description` },
            details: { rawtext: [isActive, { text: " §7|§r " + selectedVersion }, { text: "\n" }, ...activeVersionTags] },
            versionList: { rawtext: [{ translate: "kairo.addonSetting.registerdAddonList" }, { text: "\n" }, ...versionListRawtext] }
        };
        addonDataForm
            .title(addonDataRawtexts.name)
            .header(addonDataRawtexts.name)
            .label(addonDataRawtexts.description)
            .label(addonDataRawtexts.details)
            .divider()
            .label(addonDataRawtexts.versionList)
            .divider()
            .label(requiredAddonsStr)
            .divider()
            .dropdown("バージョン選択", selectableVersions, { defaultValueIndex: selectedVersionIndex })
            .toggle("有効化", { defaultValue: addonData.isActive })
            .submitButton("変更を送信");
        const { formValues, canceled: dataFormCanceled } = await addonDataForm.show(player);
        if (dataFormCanceled || formValues === undefined)
            return;
        const versionIndex = Number(formValues[8]);
        const newSelectedVersion = selectableVersions[versionIndex];
        if (newSelectedVersion === undefined)
            return;
        this.addonManager.changeAddonSettings(addonData, newSelectedVersion, formValues[9]);
    }
}
