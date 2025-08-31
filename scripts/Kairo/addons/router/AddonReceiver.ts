import type { ScriptEventCommandMessageAfterEvent } from "@minecraft/server";
import type { AddonManager } from "../AddonManager";
import { SCRIPT_EVENT_ID_PREFIX, SCRIPT_EVENT_MESSAGES } from "../../../constants/scriptevent";

export class AddonReceiver {
    private constructor(private readonly addonManager: AddonManager) {}

    public static create(addonManager: AddonManager): AddonReceiver {
        return new AddonReceiver(addonManager);
    }

    public handleScriptEvent = (ev: ScriptEventCommandMessageAfterEvent): void => {
        const { id, message, sourceEntity } = ev;

        const addonProperty = this.addonManager.getSelfAddonProperty();
        if (id !== `${SCRIPT_EVENT_ID_PREFIX.KAIRO}:${addonProperty.sessionId}`) return;

        switch (message) {
            case SCRIPT_EVENT_MESSAGES.ACTIVATE_REQUEST:
                this.addonManager._activeAddon();
                break;
            case SCRIPT_EVENT_MESSAGES.DEACTIVATE_REQUEST:
                this.addonManager._inactiveAddon();
                break;
        }
    }
}