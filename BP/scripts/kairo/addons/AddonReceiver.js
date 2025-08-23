export class AddonReceiver {
    constructor(addonManager) {
        this.addonManager = addonManager;
        this.handleScriptEvent = (ev) => {
            const { id, message, sourceEntity } = ev;
            const addonProperty = this.addonManager.getSelfAddonProperty();
            if (id !== `kairo:${addonProperty.sessionId}`)
                return;
            switch (message) {
                case "active request":
                    this.addonManager.activeAddon();
                    break;
            }
        };
    }
    static create(addonManager) {
        return new AddonReceiver(addonManager);
    }
}
