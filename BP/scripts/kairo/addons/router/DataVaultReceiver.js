import { SCRIPT_EVENT_COMMAND_IDS } from "../../constants/scriptevent";
export class DataVaultReceiver {
    constructor(addonManager) {
        this.addonManager = addonManager;
        this.lastDataLoaded = "";
        this.lastDataLoadedCount = 0;
        this.handleOnScriptEvent = (message) => {
            const split = message.split(" ");
            const command = split[0];
            const data = split.slice(1).join(" ");
            if (command === SCRIPT_EVENT_COMMAND_IDS.DATA_LOADED) {
                this.lastDataLoaded = data;
                this.lastDataLoadedCount += 1;
            }
        };
    }
    static create(addonManager) {
        return new DataVaultReceiver(addonManager);
    }
    getLastDataLoaded() {
        return { data: this.lastDataLoaded, count: this.lastDataLoadedCount };
    }
}
