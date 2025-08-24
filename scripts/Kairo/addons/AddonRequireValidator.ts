import { type Player } from "@minecraft/server";
import { VersionManager } from "../../utils/versionManager";
import type { AddonData, AddonManager } from "./AddonManager";
import { MessageFormData } from "@minecraft/server-ui";
import { ConsoleManager } from "../../utils/consoleManager";

export class AddonRequireValidator {
    private constructor(private readonly addonManager: AddonManager) {}
    public static create(addonManager: AddonManager): AddonRequireValidator {
        return new AddonRequireValidator(addonManager);
    }

    // 有効にするべきアドオンを配列にまとめる必要がある。
    public async validateRequiredAddons(player: Player, addonData: AddonData, newVersion: string, isActive: boolean): Promise<void> {
        const newActiveVersion = newVersion === "latest version"
            ? Object.keys(addonData.versions)
                .filter(v => addonData.versions[v]?.isRegistered)
                .sort((a, b) => VersionManager.compare(b, a))[0]
            : newVersion;
        if (newActiveVersion === undefined) return;
        const newActiveVersionData = addonData.versions[newActiveVersion];
        if (newActiveVersionData === undefined 
            || newActiveVersionData.requiredAddons === undefined
        ) return;

        for (const [id, version] of Object.entries(newActiveVersionData.requiredAddons)) {
            const requiredAddons = this.addonManager.getAddonsData().get(id);
            if (!requiredAddons) {
                /**
                 * 登録時に前提アドオンがそもそも登録されていない場合ははじいているので、
                 * ここでrequiredAddonsが壊れている場合、登録されていないわけではない
                 * Since addons that lack required dependencies are already rejected at registration, 
                 * if requiredAddons is corrupted here, it does not mean the addon was not registered
                 */
                ConsoleManager.error(`The addon's data format is corrupted. id=${id}`);
                return;
            }

            if (!this.isAddonActive(requiredAddons, version)) {
                const isEnabledLatest = await this.enableLatestVersionForm(player, id);
                if (isEnabledLatest) {
                    await this.validateRequiredAddons(player, requiredAddons, "latest version", true);
                    continue;
                }
                
                const isEnabledSpecific = await this.enableSpecificVersionForm(player, id, version);
                if (isEnabledSpecific) {
                    await this.validateRequiredAddons(player, requiredAddons, version, true);
                    continue;
                }
                return;
            }
        }
        this.addonManager.changeAddonSettings(addonData, newVersion, isActive)
    }

    private async enableLatestVersionForm(player: Player, addonName: string): Promise<boolean> {
        const messageForm = new MessageFormData()
            .title({ translate: "kairo.addonSetting.enableLatestVersion.title" })
            .body({ translate: "kairo.addonSetting.enableLatestVersion.body", with: [addonName] })
            .button1({ translate: "kairo.addonSetting.messageForm.button1" })
            .button2({ translate: "kairo.addonSetting.messageForm.button2" });
        
        const { selection, canceled } = await messageForm.show(player);
        if (canceled || selection === undefined) return false;

        switch (selection) {
            case 0: return true;
            case 1: return false;
            default: return false;
        }
    }

    private async enableSpecificVersionForm(player: Player, addonName: string, versions: string): Promise<boolean> {
        const messageForm = new MessageFormData()
            .title({ translate: "kairo.addonSetting.enableSpecificVersion.title" })
            .body({ translate: "kairo.addonSetting.enableSpecificVersion.body", with: [addonName, versions] })
            .button1({ translate: "kairo.addonSetting.messageForm.button1" })
            .button2({ translate: "kairo.addonSetting.messageForm.button2" });

        const { selection, canceled } = await messageForm.show(player);
        if (canceled || selection === undefined) return false;

        switch (selection) {
            case 0: return true;
            case 1: return false;
            default: return false;
        }
    }

    private isAddonActive(addonData: AddonData, version: string): boolean {
        if (!addonData) return false;
        if (!addonData.isActive) return false;

        return VersionManager.compare(addonData.activeVersion, version) >= 0;
    }
}