import { type Player } from "@minecraft/server";
import { VersionManager } from "../../utils/versionManager";
import type { AddonData, AddonManager } from "./AddonManager";
import { MessageFormData } from "@minecraft/server-ui";
import { ConsoleManager } from "../../utils/consoleManager";

interface QueueAddonData {
    addonData: AddonData;
    version: string;
    isLatest: boolean;
}

export class AddonRequireValidator {
    private readonly activationQueue: Map<string, QueueAddonData> = new Map();

    private constructor(private readonly addonManager: AddonManager) {}
    public static create(addonManager: AddonManager): AddonRequireValidator {
        return new AddonRequireValidator(addonManager);
    }

    // 有効にするべきアドオンを配列にまとめる必要がある。
    public async validateRequiredAddons(player: Player, addonData: AddonData, newVersion: string, isActive: boolean): Promise<void> {
        /**
         * 有効にする場合は、前提アドオンも有効にする必要がある
         * 無効にする場合は、自身が依存されているかどうかを調べ、依存されていれば、そのアドオンも無効化する
         */
        if (isActive) {
            this.clearActivationQueue();
            const isValid = await this.resolveRequiredAddonsForActivation(player, addonData, newVersion);
            if (!isValid) {
                this.clearActivationQueue();
                return;
            }

            for (const [id, {addonData, version}] of this.activationQueue.entries()) {
                this.addonManager.changeAddonSettings(addonData, version, true);
            }
        }
        else {
            // 無効にするパターンも作る
        }
    }

    private async resolveRequiredAddonsForActivation(player: Player, addonData: AddonData, newVersion: string): Promise<boolean> {
        const newActiveVersion = newVersion === "latest version"
            ? Object.keys(addonData.versions)
                .filter(v => addonData.versions[v]?.isRegistered)
                .sort((a, b) => VersionManager.compare(b, a))[0]
            : newVersion;
        if (newActiveVersion === undefined) return false;

        const newActiveVersionData = addonData.versions[newActiveVersion];
        if (!newActiveVersionData) return false;
        const requiredAddons = newActiveVersionData.requiredAddons ?? {};

        for (const [id, version] of Object.entries(requiredAddons)) {
            const requiredAddon = this.addonManager.getAddonsData().get(id);
            if (!requiredAddon) {
                /**
                 * 登録時に前提アドオンがそもそも登録されていない場合ははじいているので、
                 * ここでrequiredAddonが壊れている場合、登録されていないわけではない
                 * Since addons that lack required dependencies are already rejected at registration, 
                 * if requiredAddons is corrupted here, it does not mean the addon was not registered
                 */
                ConsoleManager.error(`Addon data corrupted: parent=${addonData.id}@${newActiveVersion}, missing required=${id}@${version}`);
                return false;
            }

            if (!this.isAddonActive(requiredAddon, version)) {
                const isEnabledLatest = await this.confirmEnableForm(player, "latestVersion", requiredAddon.name);
                if (isEnabledLatest) {
                    const isValidLatest = await this.resolveRequiredAddonsForActivation(player, requiredAddon, "latest version");
                    if (!isValidLatest) return false;
                    continue;
                }

                const isEnabledSpecific = await this.confirmEnableForm(player, "specificVersion", requiredAddon.name, version);
                if (isEnabledSpecific) {
                    const isValidSpecific = await this.resolveRequiredAddonsForActivation(player, requiredAddon, version);
                    if (!isValidSpecific) return false;
                    continue;
                }
                /** 
                 * ひとつでもキャンセルされたら何も変更しない
                 * If any are canceled, do not change anything
                 */
                return false;
            }
        }

        const isLatest = newVersion === "latest version";
        this.activationQueue.set(addonData.id, { addonData, version: newActiveVersion, isLatest });
        
        return true;
    }

    private async confirmEnableForm(player: Player, key: "latestVersion" | "specificVersion", addonName: string, version?: string): Promise<boolean> {
        const bodyWith = version ? [addonName, version] : [addonName];

        const messageForm = new MessageFormData()
            .title({ translate: `kairo.addonSetting.enable${key}.title` })
            .body({ translate: `kairo.addonSetting.enable${key}.body`, with: bodyWith })
            .button1({ translate: "kairo.addonSetting.messageForm.button1" })
            .button2({ translate: "kairo.addonSetting.messageForm.button2" });

        const { selection, canceled } = await messageForm.show(player);
        return !canceled && selection === 0;
    }

    private isAddonActive(addonData: AddonData, version: string): boolean {
        if (this.activationQueue.has(addonData.id)) {
            const queueAddonData = this.activationQueue.get(addonData.id);
            if (queueAddonData && VersionManager.compare(queueAddonData.version, version) >= 0) return true;
        }

        if (!addonData) return false;
        if (!addonData.isActive) return false;

        return VersionManager.compare(addonData.activeVersion, version) >= 0;
    }

    private clearActivationQueue() {
        this.activationQueue.clear();
    }
}