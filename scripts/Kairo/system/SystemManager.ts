import type { Kairo } from "..";
import type { DataVaultLastDataLoaded } from "../addons/router/DataVaultReceiver";
import { DEFAULT_KAIRO_STATES } from "../constants/states";
import { SystemEventManager } from "./events/SystemEventManager";
import { PlayerKairoDataManager } from "./PlayerKairoDataManager";

export class SystemManager {
    private readonly systemEventManager: SystemEventManager;
    private readonly playerKairoDataManager: PlayerKairoDataManager;

    private constructor(private readonly kairo: Kairo) {
        this.systemEventManager = SystemEventManager.create(this);
        this.playerKairoDataManager = PlayerKairoDataManager.create(this, DEFAULT_KAIRO_STATES);
    }
    public static create(kairo: Kairo): SystemManager {
        return new SystemManager(kairo);
    }

    public initialize(): void {
        this.playerKairoDataManager.init();
    }

    public subscribeEvents(): void {
        this.systemEventManager.subscribeAll();
    }

    public unsubscribeEvents(): void {
        this.systemEventManager.unsubscribeAll();
    }

    public getDataVaultLastDataLoaded(): DataVaultLastDataLoaded {
        return this.kairo.getDataVaultLastDataLoaded();
    }

    public waitForDataVaultNewDataLoaded(
        key: string,
        lastCount: number | undefined = undefined,
    ): Promise<DataVaultLastDataLoaded> {
        return this.kairo.waitForDataVaultNewDataLoaded(key, lastCount);
    }
}
