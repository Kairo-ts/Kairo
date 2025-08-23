import type { ScriptEventCommandMessageAfterEvent } from "@minecraft/server";
import type { AddonManager } from "./AddonManager";

export class AddonReceiver {
    private constructor(private readonly addonManager: AddonManager) {}

    public static create(addonManager: AddonManager): AddonReceiver {
        return new AddonReceiver(addonManager);
    }

    public handleScriptEvent = (ev: ScriptEventCommandMessageAfterEvent): void => {
        const { id, message, sourceEntity } = ev;

        const addonProperty = this.addonManager.getSelfAddonProperty();
        if (id !== `kairo:${addonProperty.sessionId}`) return;

        switch (message) {
            case "active request":
                this.addonManager.activeAddon();
                break;
            case "inactive request":
                this.addonManager.inactiveAddon();
                break;
        }
    }
}