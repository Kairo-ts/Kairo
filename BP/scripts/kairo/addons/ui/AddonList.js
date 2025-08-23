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
        const isActive = addonData.isActive ? { translate: "kairo.addonList.active" } : { translate: "kairo.addonList.inactive" };
        const selectedVersion = addonData.selectedVersion === "latest version"
            ? [{ translate: "kairo.addonSetting.latestVersion" }, { text: ` (ver.${addonData.activeVersion})` }]
            : [{ text: `ver.${addonData.selectedVersion}` }];
        const tags = addonData.versions[addonData.activeVersion]?.tags || [];
        const activeVersionTags = tags.flatMap((tag, index) => {
            const element = supportedTags.includes(tag)
                ? { translate: `kairo.tags.${tag}` }
                : { text: tag };
            if (index < tags.length - 1) {
                return [element, { text: ", " }];
            }
            return [element];
        });
        const requiredAddons = Object.entries(addonData.versions[addonData.activeVersion]?.requiredAddons || {});
        const requiredAddonsRawtext = requiredAddons.length > 0
            ? {
                rawtext: [
                    { translate: "kairo.addonSetting.required" }, { text: "\n" },
                    ...requiredAddons.flatMap(([name, version], i, arr) => {
                        const elements = [
                            { text: `§f${name}§r §7- (ver.${version})§r` }
                        ];
                        if (i < arr.length - 1) {
                            elements.push({ text: "\n" });
                        }
                        return elements;
                    })
                ]
            }
            : { rawtext: [{ translate: "kairo.addonSetting.required" }, { text: "\n" }, { translate: "kairo.addonSetting.nonerequired" }] };
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
            details: { rawtext: [isActive, { text: " §7|§r " }, ...selectedVersion, { text: "\n§7§o" }, ...activeVersionTags, { text: "§r" }] },
            required: { rawtext: [requiredAddonsRawtext] },
            versionList: { rawtext: [{ translate: "kairo.addonSetting.registerdAddonList" }, { text: "\n" }, ...versionListRawtext] },
            selectVersion: { translate: "kairo.addonSetting.selectVersion" },
            activate: { translate: "kairo.addonSetting.activate" },
            submit: { translate: "kairo.addonSetting.submit" }
        };
        const registeredVersions = [
            ...entries
                .filter(([version, data]) => data.isRegistered)
                .map(([version]) => version)
        ];
        const selectableVersions = ["latest version", ...registeredVersions];
        const selectedVersionIndex = selectableVersions.indexOf(addonData.selectedVersion);
        const selectableVersionsRawtexts = [
            { translate: "kairo.addonSetting.latestVersion" },
            ...registeredVersions.map(version => ({ text: version }))
        ];
        addonDataForm
            .title(addonDataRawtexts.name)
            .header(addonDataRawtexts.name)
            .label(addonDataRawtexts.description)
            .label(addonDataRawtexts.details)
            .divider()
            .label(addonDataRawtexts.versionList)
            .divider()
            .label(addonDataRawtexts.required)
            .divider()
            .dropdown(addonDataRawtexts.selectVersion, selectableVersionsRawtexts, { defaultValueIndex: selectedVersionIndex })
            .toggle(addonDataRawtexts.activate, { defaultValue: addonData.isActive })
            .submitButton(addonDataRawtexts.submit);
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
