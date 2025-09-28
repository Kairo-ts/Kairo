import { SCRIPT_EVENT_COMMAND_IDS } from "../../constants/scriptevent";
import type { AddonManager } from "../AddonManager";

export class DataVaultReceiver {
    private lastDataLoaded: string = "";
    private lastDataLoadedCount: number = 0;

    private constructor(private readonly addonManager: AddonManager) {}
    public static create(addonManager: AddonManager): DataVaultReceiver {
        return new DataVaultReceiver(addonManager);
    }

    public handleOnScriptEvent = (message: string): void => {
        const split = message.split(" ");
        const command = split[0];
        const data = split.slice(1).join(" ");

        if (command === SCRIPT_EVENT_COMMAND_IDS.DATA_LOADED) {
            this.lastDataLoaded = data;
            this.lastDataLoadedCount += 1;
        }
    }

    public getLastDataLoaded(): { data: string; count: number } {
        return { data: this.lastDataLoaded, count: this.lastDataLoadedCount };
    }
}