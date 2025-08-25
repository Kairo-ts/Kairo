import type { Player } from "@minecraft/server";
import type { AddonData } from "../AddonManager";
import type { AddonRequireValidator } from "./AddonRequireValidator";

export class AddonRequireValidatorForDeactivation {
    private readonly deactivationQueue: Map<string, { addonData: AddonData, version: string }> = new Map();
    private readonly visited: Map<string, string> = new Map();
    private readonly visiting: Set<string> = new Set();

    private constructor(private readonly requireValidator: AddonRequireValidator) {}
    
    public static create(requireValidator: AddonRequireValidator): AddonRequireValidatorForDeactivation {
        return new AddonRequireValidatorForDeactivation(requireValidator);
    }

    public async validateRequiredAddonsForDeactivation(player: Player, addonData: AddonData): Promise<void> {
        
    }

    private clearDeactivationQueue() {
        this.deactivationQueue.clear();
        this.visited.clear();
        this.visiting.clear();
    }
}