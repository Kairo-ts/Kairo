import type { Vector3 } from "@minecraft/server";
import { SCRIPT_EVENT_COMMAND_IDS } from "../../constants/scriptevent";
import type { KairoCommand } from "../../utils/KairoUtils";
import type { AddonManager } from "../AddonManager";

export interface DataVaultLastDataLoaded {
    value: boolean | number | string | Vector3 | null;
    key: string;
    count: number;
}

export class DataVaultReceiver {
    private lastLoaded: DataVaultLastDataLoaded = {
        value: null,
        key: "",
        count: 0,
    };

    private waiters: Array<{
        key: string;
        lastCount: number;
        resolve: (value: DataVaultLastDataLoaded) => void;
    }> = [];

    private constructor(private readonly addonManager: AddonManager) {}
    public static create(addonManager: AddonManager): DataVaultReceiver {
        return new DataVaultReceiver(addonManager);
    }

    public handleOnScriptEvent = (data: KairoCommand): void => {
        if (data.commandId === SCRIPT_EVENT_COMMAND_IDS.DATA_LOADED) {
            const value = data.type === "string" ? data.value : JSON.parse(data.value);

            this.lastLoaded = {
                value,
                key: data.key,
                count: this.lastLoaded.count + 1,
            };

            for (let i = this.waiters.length - 1; i >= 0; i--) {
                const waiters = this.waiters[i];
                if (!waiters) continue;

                if (
                    waiters.key === this.lastLoaded.key &&
                    this.lastLoaded.count > waiters.lastCount
                ) {
                    waiters.resolve({ ...this.lastLoaded });

                    this.waiters.splice(i, 1);
                }
            }
        }
    };

    public getLastDataLoaded(): DataVaultLastDataLoaded {
        return { ...this.lastLoaded };
    }

    public waitForNewDataLoaded(
        key: string,
        lastCount: number = this.lastLoaded.count,
    ): Promise<DataVaultLastDataLoaded> {
        return new Promise((resolve) => {
            this.waiters.push({ key, lastCount, resolve });
        });
    }
}
