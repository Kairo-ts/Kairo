import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import type { AddonData, AddonManager } from "../AddonManager";
import type { Player, ScriptEventCommandMessageAfterEvent } from "@minecraft/server";

export class AddonList {
    private constructor(private readonly addonManager: AddonManager) {}
    public static create(addonManager: AddonManager): AddonList {
        return new AddonList(addonManager);
    }

    public handleScriptEvent = (ev: ScriptEventCommandMessageAfterEvent): void => {
        const { id, message, sourceEntity } = ev;

        if (sourceEntity?.typeId !== "minecraft:player") return;
        
        if (id === "kairo:addonList") {
            this.showAddonList(sourceEntity as Player);
        }
    }

    public async showAddonList(player: Player): Promise<void> {
        const addonsData = Array.from(this.addonManager.getAddonsData());

        const addonListForm = new ActionFormData();
        addonListForm.title({"rawtext": [{ translate: "kairo.addonList.title" }]});

        addonsData.forEach(([name, data]) => {
            const isActive = data.isActive ? `§l§9有効§r` : `§l§4無効§r`;
            addonListForm.button(`§l§8${name}§r\n${isActive} §8(${data.selectedVersion})§r`, `textures/${name}/pack_icon`);
        });

        const { selection, canceled: listFormCanceled } = await addonListForm.show(player);
        if (listFormCanceled || selection === undefined) return;

        const selectedAddon = addonsData[selection];
        if (!selectedAddon) return;

        this.settingAddonDataForm(player, selectedAddon[1]);
    }

    public async settingAddonDataForm(player: Player, addonData: AddonData): Promise<void> {
        const addonDataForm = new ModalFormData();
        const entries = Object.entries(addonData.versions);
        const versionList = entries.map(
            ([version, data]) => {
                return data.isRegistered
                    ? version === addonData.activeVersion
                        ? `§f${version}§r` + " §9(§oactive§r§9)§r"
                        : `§f${version}§r`
                    : `§7${version} (§ouninstalled§r)`;
            }
        );

        const selectableVersions = [
            "latest version", 
            ...entries
                .filter(([version, data]) => data.isRegistered)
                .map(([version]) => version)
        ];
        const selectedVersionIndex = selectableVersions.indexOf(addonData.selectedVersion);

        const isActive = addonData.isActive ? "§l§9有効§r" : "§l§4無効§r";
        const selectedVersion = addonData.selectedVersion === "latest version"
            ? "latest version" + ` (ver.${addonData.activeVersion})`
            : `ver.${addonData.selectedVersion}`;

        const activeVersionTags = addonData.versions[addonData.activeVersion]?.tags || [];
        const requiredAddons = Object.entries(addonData.versions[addonData.activeVersion]?.requiredAddons || {});
        const requiredAddonsStr = requiredAddons.length > 0
            ? "§l前提アドオン§r\n" + requiredAddons.map(([name, version]) => `§f${name}§r §7- (ver.${version})§r`).join("\n")
            : "§l前提アドオン§r\n§7§oNo addons required§r";

        addonDataForm
            .title(addonData.name)
            .header(addonData.name)
            .label(`${addonData.description[1]}`)
            .label(isActive + " §7|§r " + selectedVersion + "\n" + activeVersionTags.join(", "))
            .divider()
            .label("§l登録済みバージョン一覧§r\n" + versionList.join("\n"))
            .divider()
            .label(requiredAddonsStr)
            .divider()
            .dropdown("バージョン選択", selectableVersions, { defaultValueIndex: selectedVersionIndex })
            .toggle("有効化", { defaultValue:addonData.isActive })
            .submitButton("変更を送信");

        const { formValues, canceled: dataFormCanceled } = await addonDataForm.show(player);
        if (dataFormCanceled || formValues === undefined) return;

        const versionIndex = Number(formValues[8]);
        const newSelectedVersion = selectableVersions[versionIndex];
        if (newSelectedVersion === undefined) return;
        this.addonManager.changeAddonSettings(addonData, newSelectedVersion as string, formValues[9] as boolean);
    }
}