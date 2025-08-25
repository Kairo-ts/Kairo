import { type Player } from "@minecraft/server";
import { VersionManager } from "../../utils/VersionManager";
import type { AddonData, AddonManager } from "./AddonManager";
import { MessageFormData } from "@minecraft/server-ui";
import { ConsoleManager } from "../../utils/ConsoleManager";
import { VERSION_KEYWORDS } from "../constants";

export class AddonRequireValidator {
    private readonly activationQueue: Map<string, { addonData: AddonData, version: string }> = new Map();
    private readonly visited: Map<string, string> = new Map();
    private readonly visiting: Set<string> = new Set();

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
            const isResolved = this.resolveRequiredAddonsForActivation(addonData, newVersion);
            if (!isResolved) {
                this.clearActivationQueue();
                // エラー専用の ActionForm を作って、エラーを表示する
                return;
            }

            if (this.activationQueue.size > 1) {
                const rootAddonId = addonData.id;
                const queueAddonList = Array.from(this.activationQueue.values())
                    .filter(({ addonData }) => addonData.id !== rootAddonId)
                    .map(({ addonData, version }) =>  `${addonData.name} (ver.${version})`)
                    .join("\n");
                const messageForm = new MessageFormData()
                    .title({ translate: "kairo.addonSetting.required.title" })
                    .body({ translate: "kairo.addonSetting.required.body", with: [queueAddonList] })
                    .button1({ translate: "kairo.addonSetting.required.active" })
                    .button2({ translate: "kairo.addonSetting.required.cancel" });
                const { selection, canceled } = await messageForm.show(player);
                if (canceled || selection === undefined || selection === 1) {
                    this.clearActivationQueue();
                    return;
                }
            }

            for (const {addonData, version} of this.activationQueue.values()) {
                this.addonManager.changeAddonSettings(addonData, version, isActive);
            }
            this.clearActivationQueue();
        }
        else {
            // 無効にするパターンも作る
        }
    }

    private resolveRequiredAddonsForActivation(addonData: AddonData, newVersion: string): boolean {
        const newActiveVersion = newVersion === VERSION_KEYWORDS.LATEST
            ? this.addonManager.getLatestVersion(addonData.id)
            : newVersion;
        if (newActiveVersion === undefined) return false;

        if (this.visited.has(addonData.id)) {
            const visitedVersion = this.visited.get(addonData.id);
            if (visitedVersion && VersionManager.compare(visitedVersion, newActiveVersion) >= 0) {
                return true;
            }
        }
    
        if (this.visiting.has(addonData.id)) return false;
        this.visiting.add(addonData.id);

        try {
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

                // latest version を返すutilを作る

                if (!this.isAddonActive(requiredAddon, version)) {
                    const requireLatestStableVersion = this.addonManager.getLatestStableVersion(id);
                    if (!requireLatestStableVersion) {
                        /**
                         * 登録時に前提アドオンが登録されているかどうかで、設定を変更できるかどうかを決めるため、
                         * ここで前提アドオンが最新バージョンでも対応していないなんてことは普通は起こらない
                         * At registration, whether required addons are present determines if settings can be changed,
                         * therefore, it is unusual for a required addon to be unsupported even at its latest version here
                         */
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
                        if (!isResolved) return false;
                    }
                    else {
                        const isResolved = this.resolveRequiredAddonsForActivation(requiredAddon, requireLatestStableVersion);
                        if (!isResolved) return false;
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

    private isAddonActive(addonData: AddonData, version: string): boolean {
        const queued = this.activationQueue.get(addonData.id);
        if (queued && VersionManager.compare(queued.version, version) >= 0) return true;

        if (!addonData) return false;
        if (!addonData.isActive) return false;

        return VersionManager.compare(addonData.activeVersion, version) >= 0;
    }

    private clearActivationQueue() {
        this.activationQueue.clear();
        this.visited.clear();
        this.visiting.clear();
    }
}