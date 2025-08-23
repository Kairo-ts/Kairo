export class AddonReceiver {
    constructor(addonManager) {
        this.addonManager = addonManager;
        this.handleScriptEvent = (ev) => {
            const { id, message, sourceEntity } = ev;
            const addonProperty = this.addonManager.getSelfAddonProperty();
            if (id !== `kairo:${addonProperty.sessionId}`)
                return;
            // Handle the event for the specific addon
        };
    }
    static create(addonManager) {
        return new AddonReceiver(addonManager);
    }
}
