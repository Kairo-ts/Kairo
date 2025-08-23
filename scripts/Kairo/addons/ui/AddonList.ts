import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import type { AddonData, AddonManager } from "../AddonManager";
import type { Player, RawMessage, ScriptEventCommandMessageAfterEvent } from "@minecraft/server";
import { SCRIPT_EVENT_IDS } from "../../constants";
import { properties, supportedTags } from "../../../properties";

interface AddonDataRawtexts {
    name: RawMessage;
    description: RawMessage;
    details: RawMessage;
    required: RawMessage;
    versionList: RawMessage;
    selectVersion: RawMessage;
    activate: RawMessage;
    submit: RawMessage;
}

export class AddonList {
    private constructor(private readonly addonManager: AddonManager) {}
    public static create(addonManager: AddonManager): AddonList {
        return new AddonList(addonManager);
    }

    public handleScriptEvent = (ev: ScriptEventCommandMessageAfterEvent): void => {
        const { id, message, sourceEntity } = ev;

        if (sourceEntity?.typeId !== "minecraft:player") return;
        
        if (id === SCRIPT_EVENT_IDS.SHOW_ADDON_LIST) {
            this.showAddonList(sourceEntity as Player);
        }
    }

    public async showAddonList(player: Player): Promise<void> {
        const addonsData = Array.from(this.addonManager.getAddonsData());

        const addonListForm = new ActionFormData();
        addonListForm.title({ translate: "kairo.addonList.title" });

        addonsData.forEach(([id, data]) => {
            const isActive = data.isActive ? { translate: "kairo.addonList.active"} : { translate: "kairo.addonList.inactive" };
            addonListForm.button(
                { rawtext: [{ text: `§l§8${data.name}§r\n` }, isActive, { text: ` §8(${data.selectedVersion})§r` }] },
                `textures/${id}/pack_icon`
            );
        });

        const { selection, canceled: listFormCanceled } = await addonListForm.show(player);
        if (listFormCanceled || selection === undefined) return;

        const selectedAddon = addonsData[selection];
        if (!selectedAddon) return;

        this.formatAddonDataForDisplay(player, selectedAddon[1]);
    }

    public async formatAddonDataForDisplay(player: Player, addonData: AddonData): Promise<void> {
        const entries = Object.entries(addonData.versions);

        const isRegistered = addonData.activeVersion !== "unregistered";

        const isActive = addonData.isActive ? { translate: "kairo.addonList.active"} : { translate: "kairo.addonList.inactive" };
        const selectedVersion = isRegistered
            ? addonData.selectedVersion === "latest version"
                ? [{ text: " §7|§r " },{ translate: "kairo.addonSetting.latestVersion" },{ text: ` (ver.${addonData.activeVersion})` }]
                : [{ text: " §7|§r " },{ text: `ver.${addonData.selectedVersion}` }]
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
                    { translate: "kairo.addonSetting.required" },{ text: "\n" },
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
            : { rawtext: [{ translate: "kairo.addonSetting.required" },{ text: "\n" },{ translate: "kairo.addonSetting.nonerequired" }] };


        const versionListRawtext = entries.flatMap(([version, data]) => {
            if (data.isRegistered) {
                if (version === addonData.activeVersion) {
                    return [{ text: `§f${version}§r ` },{ translate: "kairo.addonSetting.active" },{ text: "\n" }];
                } else {
                    return [{ text: `§f${version}§r` },{ text: "\n" }];
                }
            } else {
                return [{ text: `§7${version}§r ` },{ translate: "kairo.addonSetting.uninstalled"},{ text: "\n" }];
            }
        });

        const addonDataRawtexts: AddonDataRawtexts = {
            name: { translate: `${properties.id}.name` },
            description: { translate: `${properties.id}.description` },
            details: { rawtext: [ isActive, ...selectedVersion, ...lineBreak, ...activeVersionTags, { text: "§r" }] },
            required: { rawtext: [requiredAddonsRawtext ] },
            versionList: { rawtext: [{ translate: "kairo.addonSetting.registerdAddonList" },{ text: "\n" }, ...versionListRawtext] },
            selectVersion: { translate: "kairo.addonSetting.selectVersion" },
            activate: { translate: "kairo.addonSetting.activate" },
            submit: { translate: "kairo.addonSetting.submit" }
        }

        if (isRegistered) this.settingAddonDataForm(player, addonData, addonDataRawtexts);
        else this.showAddonDataForm(player, addonDataRawtexts);
    }

    private async settingAddonDataForm(player: Player, addonData: AddonData, addonDataRawtexts: AddonDataRawtexts): Promise<void> {
        const entries = Object.entries(addonData.versions);
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
        ]

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
            .toggle(addonDataRawtexts.activate, { defaultValue: addonData.isActive })
            .submitButton(addonDataRawtexts.submit);

        const { formValues, canceled } = await addonDataForm.show(player);
        if (canceled || formValues === undefined) return;
        const versionIndex = Number(formValues[8]);
        const newSelectedVersion = selectableVersions[versionIndex];
        if (newSelectedVersion === undefined) return;
        this.addonManager.changeAddonSettings(addonData, newSelectedVersion as string, formValues[9] as boolean);
    }

    private async showAddonDataForm(player: Player, addonDataRawtexts: AddonDataRawtexts): Promise<void> {
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
        if (canceled || selection === undefined) return;
    }
}