import { SCRIPT_EVENT_COMMAND_IDS } from "../../constants/scriptevent";
import type { KairoCommand } from "../../utils/KairoUtils";
import type { AddonManager } from "../AddonManager";

export class DataVaultReceiver {
    private lastDataLoaded: string = "";
    private lastDataLoadedCount: number = 0;

    private constructor(private readonly addonManager: AddonManager) {}
    public static create(addonManager: AddonManager): DataVaultReceiver {
        return new DataVaultReceiver(addonManager);
    }

    public handleOnScriptEvent = (data: KairoCommand): void => {
        if (data.commandId === SCRIPT_EVENT_COMMAND_IDS.DATA_LOADED) {
            this.lastDataLoaded = data.dataLoaded;
            this.lastDataLoadedCount += 1;
        }
    };

    public getLastDataLoaded(): { data: string; count: number } {
        return { data: this.lastDataLoaded, count: this.lastDataLoadedCount };
    }
}
