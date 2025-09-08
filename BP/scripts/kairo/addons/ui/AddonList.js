import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { properties, supportedTags } from "../../../properties";
import { SCRIPT_EVENT_IDS } from "../../../constants/scriptevent";
import { KAIRO_TRANSLATE_IDS } from "../../../constants/translate";
import { VERSION_KEYWORDS } from "../../../constants/version_keywords";
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
        addonListForm.title({ translate: KAIRO_TRANSLATE_IDS.ADDON_LIST_TITLE });
        addonsData.forEach(([id, data]) => {
            const isActive = data.isActive ? { translate: KAIRO_TRANSLATE_IDS.ADDON_LIST_ACTIVE } : { translate: KAIRO_TRANSLATE_IDS.ADDON_LIST_INACTIVE };
            addonListForm.button({ rawtext: [{ text: `§l§8${data.name}§r\n` }, isActive, { text: ` §8(${data.selectedVersion})§r` }] }, `textures/${id}/pack_icon`);
        });
        const { selection, canceled: listFormCanceled } = await addonListForm.show(player);
        if (listFormCanceled || selection === undefined)
            return;
        const selectedAddon = addonsData[selection];
        if (!selectedAddon)
            return;
        this.formatAddonDataForDisplay(player, selectedAddon[1]);
    }
    async formatAddonDataForDisplay(player, addonData) {
        const entries = Object.entries(addonData.versions);
        const isRegistered = addonData.activeVersion !== VERSION_KEYWORDS.UNREGISTERED;
        const isActive = addonData.isActive ? { translate: KAIRO_TRANSLATE_IDS.ADDON_LIST_ACTIVE } : { translate: KAIRO_TRANSLATE_IDS.ADDON_LIST_INACTIVE };
        const selectedVersion = isRegistered
            ? addonData.selectedVersion === VERSION_KEYWORDS.LATEST
                ? [{ text: " §7|§r " }, { translate: KAIRO_TRANSLATE_IDS.ADDON_SETTING_LATEST_VERSION }, { text: ` (ver.${addonData.activeVersion})` }]
                : [{ text: " §7|§r " }, { text: `ver.${addonData.selectedVersion}` }]
            : [];
        const tags = addonData.versions[addonData.activeVersion]?.tags || [];
        const lineBreak = tags.length > 0 ? [{ text: "\n§7§o" }] : [];
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
                    { translate: KAIRO_TRANSLATE_IDS.ADDON_SETTING_REQUIRED }, { text: "\n" },
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
            : { rawtext: [{ translate: KAIRO_TRANSLATE_IDS.ADDON_SETTING_REQUIRED }, { text: "\n" }, { translate: KAIRO_TRANSLATE_IDS.ADDON_SETTING_NONE_REQUIRED }] };
        const versionListRawtext = entries.flatMap(([version, data]) => {
            let versionRawtext = [];
            switch (data.registrationState) {
                case "registered":
                    versionRawtext.push({ text: `§f${version}§r ` });
                    break;
                case "unregistered":
                case "missing_requiredAddons":
                    versionRawtext.push({ text: `§7${version}§r ` });
                    break;
            }
            switch (version) {
                case addonData.activeVersion:
                    versionRawtext.push({ translate: KAIRO_TRANSLATE_IDS.ADDON_SETTING_ACTIVE });
                    break;
                case addonData.selectedVersion:
                    versionRawtext.push({ translate: KAIRO_TRANSLATE_IDS.ADDON_SETTING_SELECTED });
                    break;
            }
            switch (data.registrationState) {
                case "registered":
                    break;
                case "unregistered":
                    versionRawtext.push({ translate: KAIRO_TRANSLATE_IDS.ADDON_SETTING_UNINSTALLED });
                    break;
                case "missing_requiredAddons":
                    versionRawtext.push({ translate: KAIRO_TRANSLATE_IDS.ADDON_SETTING_MISSING_REQUIRED });
                    break;
            }
            versionRawtext.push({ text: "\n" });
            return versionRawtext;
        });
        const addonDataRawtexts = {
            name: { translate: `${properties.id}.name` },
            description: { translate: `${properties.id}.description` },
            details: { rawtext: [isActive, ...selectedVersion, ...lineBreak, ...activeVersionTags, { text: "§r" }] },
            required: { rawtext: [requiredAddonsRawtext] },
            versionList: { rawtext: [{ translate: KAIRO_TRANSLATE_IDS.ADDON_SETTING_REGISTERED_ADDON_LIST }, { text: "\n" }, ...versionListRawtext] },
            selectVersion: { translate: KAIRO_TRANSLATE_IDS.ADDON_SETTING_SELECT_VERSION },
            activate: { translate: KAIRO_TRANSLATE_IDS.ADDON_SETTING_ACTIVATE },
            submit: { translate: KAIRO_TRANSLATE_IDS.ADDON_SETTING_SUBMIT }
        };
        if (isRegistered)
            this.settingAddonDataForm(player, addonData, addonDataRawtexts);
        else
            this.showAddonDataForm(player, addonDataRawtexts);
    }
    async settingAddonDataForm(player, addonData, addonDataRawtexts) {
        const entries = Object.entries(addonData.versions);
        const registeredVersions = [
            ...entries
                .filter(([version, data]) => data.isRegistered)
                .map(([version]) => version)
        ];
        const selectableVersions = [VERSION_KEYWORDS.LATEST, ...registeredVersions];
        let selectedVersionIndex = selectableVersions.indexOf(addonData.selectedVersion);
        if (selectedVersionIndex === -1)
            selectedVersionIndex = 0;
        const selectableVersionsRawtexts = [
            { translate: KAIRO_TRANSLATE_IDS.ADDON_SETTING_LATEST_VERSION },
            ...registeredVersions.map(version => ({ text: version }))
        ];
        const currentActiveState = addonData.isActive;
        const addonDataForm = new ModalFormData()
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
            .toggle(addonDataRawtexts.activate, { defaultValue: currentActiveState })
            .submitButton(addonDataRawtexts.submit);
        const { formValues, canceled } = await addonDataForm.show(player);
        if (canceled || formValues === undefined)
            return;
        // 有効化するときは、バージョンの変更も一緒に渡す
        // 無効化するときは、バージョンを考慮せず無効化処理だけ
        const newVersionIndex = Number(formValues[8]);
        const newSelectedVersion = selectableVersions[newVersionIndex];
        if (newSelectedVersion === undefined)
            return;
        const newActiveState = formValues[9];
        if ((currentActiveState === false && newActiveState === true) || newVersionIndex !== selectedVersionIndex) {
            // 有効化にする場合 or バージョンを変更する場合
            this.addonManager.activateAddon(player, addonData, newSelectedVersion);
        }
        else if (currentActiveState === true && newActiveState === false) {
            // 無効化にする場合
            this.addonManager.deactivateAddon(player, addonData);
        }
    }
    async showAddonDataForm(player, addonDataRawtexts) {
        const addonDataForm = new ActionFormData()
            .title(addonDataRawtexts.name)
            .header(addonDataRawtexts.name)
            .label(addonDataRawtexts.description)
            .label(addonDataRawtexts.details)
            .divider()
            .label(addonDataRawtexts.versionList)
            .divider()
            .label(addonDataRawtexts.required);
        const { selection, canceled } = await addonDataForm.show(player);
        if (canceled || selection === undefined)
            return;
    }
}
