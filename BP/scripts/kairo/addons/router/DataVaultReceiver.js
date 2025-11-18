import { SCRIPT_EVENT_COMMAND_IDS } from "../../constants/scriptevent";
export class DataVaultReceiver {
    constructor(addonManager) {
        this.addonManager = addonManager;
        this.lastDataLoaded = "";
        this.lastDataLoadedCount = 0;
        this.handleOnScriptEvent = (data) => {
            if (data.commandId === SCRIPT_EVENT_COMMAND_IDS.DATA_LOADED) {
                this.lastDataLoaded = data.dataLoaded;
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
