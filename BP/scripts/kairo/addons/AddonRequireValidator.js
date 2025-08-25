import {} from "@minecraft/server";
import { VersionManager } from "../../utils/VersionManager";
import { MessageFormData } from "@minecraft/server-ui";
import { ConsoleManager } from "../../utils/ConsoleManager";
import { ErrorManager } from "../../utils/ErrorManager";
import { KAIRO_TRANSLATE_IDS } from "../../constants/translate";
import { VERSION_KEYWORDS } from "../../constants/version_keywords";
export class AddonRequireValidator {
    constructor(addonManager) {
        this.addonManager = addonManager;
        this.activationQueue = new Map();
        this.visited = new Map();
        this.visiting = new Set();
    }
    static create(addonManager) {
        return new AddonRequireValidator(addonManager);
    }
    async validateRequiredAddons(player, addonData, newVersion, isActive) {
        /**
         * 有効にする場合は、前提アドオンも有効にする必要がある
         * 無効にする場合は、自身が依存されているかどうかを調べ、依存されていれば、そのアドオンも無効化する
         */
        if (isActive) {
            this.clearActivationQueue();
            const isResolved = this.resolveRequiredAddonsForActivation(addonData, newVersion);
            if (!isResolved) {
                this.clearActivationQueue();
                ErrorManager.showErrorDetails(player, "kairo_resolve_for_activation_error");
                return;
            }
            if (this.activationQueue.size > 1) {
                const rootAddonId = addonData.id;
                const queueAddonList = Array.from(this.activationQueue.values())
                    .filter(({ addonData }) => addonData.id !== rootAddonId)
                    .map(({ addonData, version }) => `・${addonData.name} (ver.${version})`)
                    .join("\n");
                const messageForm = new MessageFormData()
                    .title({ translate: KAIRO_TRANSLATE_IDS.ADDON_SETTING_REQUIRED_TITLE })
                    .body({ translate: KAIRO_TRANSLATE_IDS.ADDON_SETTING_REQUIRED_BODY, with: [queueAddonList] })
                    .button1({ translate: KAIRO_TRANSLATE_IDS.ADDON_SETTING_REQUIRED_ACTIVE })
                    .button2({ translate: KAIRO_TRANSLATE_IDS.ADDON_SETTING_REQUIRED_CANCEL });
                const { selection, canceled } = await messageForm.show(player);
                if (canceled || selection === undefined || selection === 1) {
                    this.clearActivationQueue();
                    return;
                }
            }
            for (const { addonData, version } of this.activationQueue.values()) {
                this.addonManager.changeAddonSettings(addonData, version, isActive);
            }
            this.clearActivationQueue();
        }
        else {
            // 無効にするパターンも作る
        }
    }
    resolveRequiredAddonsForActivation(addonData, newVersion) {
        const newActiveVersion = newVersion === VERSION_KEYWORDS.LATEST
            ? this.addonManager.getLatestVersion(addonData.id)
            : newVersion;
        if (newActiveVersion === undefined)
            return false;
        if (this.visited.has(addonData.id)) {
            const visitedVersion = this.visited.get(addonData.id);
            if (visitedVersion && VersionManager.compare(visitedVersion, newActiveVersion) >= 0) {
                return true;
            }
        }
        if (this.visiting.has(addonData.id))
            return false;
        this.visiting.add(addonData.id);
        try {
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
                if (!this.isAddonActive(requiredAddon, version)) {
                    const requireLatestStableVersion = this.addonManager.getLatestStableVersion(id);
                    if (!requireLatestStableVersion) {
                        ConsoleManager.error(`Addon data corrupted: missing required=${id}@${version}`);
                        return false;
                    }
                    if (VersionManager.compare(requireLatestStableVersion, version) < 0) {
                        const requireLatestVersion = this.addonManager.getLatestVersion(id);
                        if (!requireLatestVersion || VersionManager.compare(requireLatestVersion, version) < 0) {
                            ConsoleManager.error(`Addon data corrupted: missing required=${id}@${version}`);
                            return false;
                        }
                        const isResolved = this.resolveRequiredAddonsForActivation(requiredAddon, requireLatestVersion);
                        if (!isResolved)
                            return false;
                    }
                    else {
                        const isResolved = this.resolveRequiredAddonsForActivation(requiredAddon, requireLatestStableVersion);
                        if (!isResolved)
                            return false;
                    }
                }
            }
            const prev = this.activationQueue.get(addonData.id);
            if (!prev || VersionManager.compare(newActiveVersion, prev.version) > 0) {
                this.activationQueue.set(addonData.id, { addonData, version: newActiveVersion });
            }
            this.visited.set(addonData.id, newActiveVersion);
            return true;
        }
        finally {
            this.visiting.delete(addonData.id);
        }
    }
    isAddonActive(addonData, version) {
        const queued = this.activationQueue.get(addonData.id);
        if (queued && VersionManager.compare(queued.version, version) >= 0)
            return true;
        if (!addonData)
            return false;
        if (!addonData.isActive)
            return false;
        return VersionManager.compare(addonData.activeVersion, version) >= 0;
    }
    clearActivationQueue() {
        this.activationQueue.clear();
        this.visited.clear();
        this.visiting.clear();
    }
}
