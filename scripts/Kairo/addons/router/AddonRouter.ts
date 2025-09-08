import type { ScriptEventCommandMessageAfterEvent } from "@minecraft/server";
import type { AddonManager } from "../AddonManager";

export class AddonRouter {
    private constructor(private readonly addonManager: AddonManager) {}
    
    public static create(addonManager: AddonManager): AddonRouter {
        return new AddonRouter(addonManager);
    }

    public handleScriptEvent(ev: ScriptEventCommandMessageAfterEvent): void {
        console.log("test");
    }
}