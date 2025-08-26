import type { Player } from "@minecraft/server";
import type { AddonData } from "../AddonManager";
import type { AddonRequireValidator } from "./AddonRequireValidator";
import { VersionManager } from "../../../utils/VersionManager";
import { ConsoleManager } from "../../../utils/ConsoleManager";
import { ErrorManager } from "../../../utils/ErrorManager";
import { MessageFormData } from "@minecraft/server-ui";
import { KAIRO_TRANSLATE_IDS } from "../../../constants/translate";

export class AddonRequireValidatorForDeactivation {
    private readonly deactivationQueue: Map<string, AddonData> = new Map();
    private readonly visited: Set<string> = new Set();
    private readonly visiting: Set<string> = new Set();

    private constructor(private readonly requireValidator: AddonRequireValidator) {}
    
    public static create(requireValidator: AddonRequireValidator): AddonRequireValidatorForDeactivation {
        return new AddonRequireValidatorForDeactivation(requireValidator);
    }

    public async validateRequiredAddonsForDeactivation(player: Player, addonData: AddonData): Promise<void> {
        this.clearDeactivationQueue();
        const isResolved = this.resolveRequiredAddonsForDeactivation(addonData);
        if (!isResolved) {
            this.clearDeactivationQueue();
            ErrorManager.showErrorDetails(player, "kairo_resolve_for_deactivation_error");
            return;
        }

        if (this.deactivationQueue.size > 1) {
            const rootAddonId = addonData.id;
            const queueAddonList = Array.from(this.deactivationQueue.values())
                .filter(( addonData ) => addonData.id !== rootAddonId)
                .map(( addonData ) => `・${addonData.name} (ver.${addonData.activeVersion})`)
                .join("\n");
            const messageForm = new MessageFormData()
                .title({ translate: KAIRO_TRANSLATE_IDS.ADDON_SETTING_REQUIRED_TITLE })
                .body({ translate: KAIRO_TRANSLATE_IDS.ADDON_SETTING_REQUIRED_DEACTIVATION_BODY, with: [queueAddonList] })
                .button1({ translate: KAIRO_TRANSLATE_IDS.ADDON_SETTING_REQUIRED_ACTIVE })
                .button2({ translate: KAIRO_TRANSLATE_IDS.ADDON_SETTING_REQUIRED_CANCEL });
            const { selection, canceled } = await messageForm.show(player);
            if (canceled || selection === undefined || selection === 1) {
                this.clearDeactivationQueue();
                return;
            }
        }

        for (const addonData of this.deactivationQueue.values()) {
            this.requireValidator.changeAddonSettings(addonData, addonData.activeVersion, false);
        }
        this.clearDeactivationQueue();
    }

    private resolveRequiredAddonsForDeactivation(addonData: AddonData): boolean {
        if (this.visited.has(addonData.id)) return true;
        if (this.visiting.has(addonData.id)) return true;
        this.visiting.add(addonData.id);

        try {
            const currentlyActiveVersion = addonData.activeVersion;
            const addonsData = this.requireValidator.getAddonsData();

            for (const data of addonsData.values()) {
                const isDeactive = this.isDeactive(data);
                if (isDeactive) continue;

                const activeVersionData = data.versions[data.activeVersion];
                const requiredAddons = activeVersionData?.requiredAddons;
                if (!requiredAddons) {
                    /**
                     * requiredAddonsが壊れている場合は不具合なので、処理を中断してエラーを表示する
                     */
                    ConsoleManager.error(`Addon data corrupted: ${data.id}@${data.activeVersion}, missing required addons`);
                    return false;
                }

                const dependentAddon = Object.entries(requiredAddons).find(([id, version]) => id === addonData.id);
                if (dependentAddon) {
                    const [id, version] = dependentAddon;
                    if (VersionManager.compare(currentlyActiveVersion, version) >= 0) {
                        const dependentAddonData = addonsData.get(id);
                        if (!dependentAddonData) {
                            /**
                             * isDeactive() でデータを既にチェック済みなので、
                             * ここで、データが無い場合は不具合。tsの型チェックのためのif文
                             */
                            ConsoleManager.error(`Addon data corrupted: ${id}@${version}, missing dependent addon`);
                            return false;
                        }

                        const isResolved = this.resolveRequiredAddonsForDeactivation(dependentAddonData);
                        if (!isResolved) return false;
                    }
                }
            }

            this.visited.add(addonData.id);
            this.deactivationQueue.set(addonData.id, addonData);
            return true;
        }
        finally {
            this.visiting.delete(addonData.id);
        }
    }

    private isDeactive(addonData: AddonData): boolean {
        const queued = this.deactivationQueue.has(addonData.id);
        if (queued) return true;

        if (!addonData) return false;
        return !addonData.isActive;
    }

    private clearDeactivationQueue() {
        this.deactivationQueue.clear();
        this.visited.clear();
        this.visiting.clear();
    }
}