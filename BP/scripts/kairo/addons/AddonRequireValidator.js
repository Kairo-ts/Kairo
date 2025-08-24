import {} from "@minecraft/server";
import { VersionManager } from "../../utils/versionManager";
import { MessageFormData } from "@minecraft/server-ui";
import { ConsoleManager } from "../../utils/consoleManager";
export class AddonRequireValidator {
    constructor(addonManager) {
        this.addonManager = addonManager;
        this.activationQueue = new Map();
        this.visited = new Map();
    }
    static create(addonManager) {
        return new AddonRequireValidator(addonManager);
    }
    // 有効にするべきアドオンを配列にまとめる必要がある。
    async validateRequiredAddons(player, addonData, newVersion, isActive) {
        /**
         * 有効にする場合は、前提アドオンも有効にする必要がある
         * 無効にする場合は、自身が依存されているかどうかを調べ、依存されていれば、そのアドオンも無効化する
         */
        if (isActive) {
            this.clearActivationQueue();
            const isResolved = await this.resolveRequiredAddonsForActivation(player, addonData, newVersion);
            if (!isResolved) {
                this.clearActivationQueue();
                return;
            }
            for (const { addonData, version } of this.activationQueue.values()) {
                this.addonManager.changeAddonSettings(addonData, version, true);
            }
        }
        else {
            // 無効にするパターンも作る
        }
    }
    async resolveRequiredAddonsForActivation(player, addonData, newVersion) {
        const newActiveVersion = newVersion === "latest version"
            ? Object.keys(addonData.versions)
                .filter(v => addonData.versions[v]?.isRegistered)
                .sort((a, b) => VersionManager.compare(b, a))[0]
            : newVersion;
        if (newActiveVersion === undefined)
            return false;
        const newActiveVersionData = addonData.versions[newActiveVersion];
        if (!newActiveVersionData)
            return false;
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
            const visitedData = this.visited.get(id) ?? { isSelectedLatest: false, isCanceledLatest: false };
            this.visited.set(id, visitedData);
            if (visitedData.isSelectedLatest)
                continue;
            if (!this.isAddonActive(requiredAddon, version)) {
                if (!visitedData.isCanceledLatest) {
                    const isEnabledLatest = await this.confirmEnableForm(player, "latestVersion", requiredAddon.name);
                    if (isEnabledLatest) {
                        const isValidLatest = await this.resolveRequiredAddonsForActivation(player, requiredAddon, "latest version");
                        if (!isValidLatest) {
                            visitedData.isCanceledLatest = true;
                            return false;
                        }
                        visitedData.isSelectedLatest = true;
                        continue;
                    }
                }
                const isEnabledSpecific = await this.confirmEnableForm(player, "specificVersion", requiredAddon.name, version);
                if (isEnabledSpecific) {
                    const isValidSpecific = await this.resolveRequiredAddonsForActivation(player, requiredAddon, version);
                    if (!isValidSpecific)
                        return false;
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
    async confirmEnableForm(player, key, addonName, version) {
        const bodyWith = version ? [addonName, version] : [addonName];
        const messageForm = new MessageFormData()
            .title({ translate: `kairo.addonSetting.enable${key}.title` })
            .body({ translate: `kairo.addonSetting.enable${key}.body`, with: bodyWith })
            .button1({ translate: "kairo.addonSetting.messageForm.button1" })
            .button2({ translate: "kairo.addonSetting.messageForm.button2" });
        const { selection, canceled } = await messageForm.show(player);
        return !canceled && selection === 0;
    }
    isAddonActive(addonData, version) {
        if (this.activationQueue.has(addonData.id)) {
            const queueAddonData = this.activationQueue.get(addonData.id);
            if (queueAddonData && VersionManager.compare(queueAddonData.version, version) >= 0)
                return true;
        }
        if (!addonData)
            return false;
        if (!addonData.isActive)
            return false;
        return VersionManager.compare(addonData.activeVersion, version) >= 0;
    }
    clearActivationQueue() {
        this.activationQueue.clear();
        this.visited.clear();
    }
}
