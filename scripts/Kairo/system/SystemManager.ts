import type { Player } from "@minecraft/server";
import type { Kairo } from "..";
import type { DataVaultLastDataLoaded } from "../addons/router/DataVaultReceiver";
import { DEFAULT_KAIRO_STATES } from "../constants/states";
import { SystemEventManager } from "./events/SystemEventManager";
import { PlayerKairoDataManager } from "./PlayerKairoDataManager";
import type { KairoCommand } from "../utils/KairoUtils";
import { systemEventReceiver } from "./SystemEventReceiver";
import { ScriptEventReceiver } from "./ScriptEventReceiver";
import type { PlayerKairoData } from "./PlayerKairoData";

export class SystemManager {
    private readonly systemEventManager: SystemEventManager;
    private readonly systemEventReceiver: systemEventReceiver;
    private readonly scriptEventReceiver: ScriptEventReceiver;
    private readonly playerKairoDataManager: PlayerKairoDataManager;

    private constructor(private readonly kairo: Kairo) {
        this.systemEventManager = SystemEventManager.create(this);
        this.systemEventReceiver = systemEventReceiver.create(this);
        this.scriptEventReceiver = ScriptEventReceiver.create(this);
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

    public addOrRestorePlayerKairoData(player: Player) {
        this.playerKairoDataManager.addOrRestorePlayerKairoData(player);
    }

    public handleOnScriptEvent = (data: KairoCommand): void => {
        this.scriptEventReceiver.handleScriptEvent(data);
    };

    public systemEventHandleOnScriptEvent = (data: KairoCommand): void => {
        this.systemEventReceiver.handleScriptEvent(data);
    };

    public getPlayerKairoData(playerId: string): PlayerKairoData {
        return this.playerKairoDataManager.getPlayerKairoData(playerId);
    }

    public getPlayersKairoData(): Map<string, PlayerKairoData> {
        return this.playerKairoDataManager.getPlayersKairoData();
    }
}
