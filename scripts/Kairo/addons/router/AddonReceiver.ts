import type { ScriptEventCommandMessageAfterEvent } from "@minecraft/server";
import type { AddonManager } from "../AddonManager";
import { SCRIPT_EVENT_MESSAGES } from "../../../constants/scriptevent";

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
            case SCRIPT_EVENT_MESSAGES.ACTIVE_REQUEST:
                this.addonManager.activeAddon();
                break;
            case SCRIPT_EVENT_MESSAGES.DEACTIVE_REQUEST:
                this.addonManager.inactiveAddon();
                break;
        }
    }
}