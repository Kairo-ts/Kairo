import type { Player } from "@minecraft/server";
import type { AddonData } from "../AddonManager";
import type { AddonRequireValidator } from "./AddonRequireValidator";
import { VersionManager } from "../../../utils/VersionManager";

export class AddonRequireValidatorForDeactivation {
    private readonly deactivationQueue: Map<string, { addonData: AddonData, version: string }> = new Map();
    private readonly visited: Map<string, string> = new Map();
    private readonly visiting: Set<string> = new Set();

    private constructor(private readonly requireValidator: AddonRequireValidator) {}
    
    public static create(requireValidator: AddonRequireValidator): AddonRequireValidatorForDeactivation {
        return new AddonRequireValidatorForDeactivation(requireValidator);
    }

    public async validateRequiredAddonsForDeactivation(player: Player, addonData: AddonData): Promise<void> {
        this.clearDeactivationQueue();
        const isResolved = this.resolveRequiredAddonsForDeactivation(addonData);

    }

    private resolveRequiredAddonsForDeactivation(addonData: AddonData): boolean {
        const currentlyActiveVersion = addonData.activeVersion;


    }

    private getDependents(addonData: AddonData): AddonData[] {
        const currentlyActiveVersion = addonData.activeVersion;
        return Array.from(this.requireValidator.getAddonsData().values()).filter(data => {
            if (!data.isActive) return false;

            const activeVersionData = data.versions[data.activeVersion];
            const requiredAddons = activeVersionData?.requiredAddons;
            if (!requiredAddons) return false;

            return Object.entries(requiredAddons).some(([id, version]) => {
                if (id !== addonData.id) return false;

                return VersionManager.compare(currentlyActiveVersion, version) >= 0;
            })
        });
        
    }

    private clearDeactivationQueue() {
        this.deactivationQueue.clear();
        this.visited.clear();
        this.visiting.clear();
    }
}