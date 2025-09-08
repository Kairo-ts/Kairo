export class AddonRouter {
    constructor(addonManager) {
        this.addonManager = addonManager;
    }
    static create(addonManager) {
        return new AddonRouter(addonManager);
    }
    handleScriptEvent(ev) {
        console.log("test");
    }
}
