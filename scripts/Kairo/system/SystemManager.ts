import type { Player } from "@minecraft/server";
import type { Kairo } from "..";
import { DEFAULT_KAIRO_STATES } from "../constants/states";
import { SystemEventManager } from "./events/SystemEventManager";
import { PlayerKairoDataManager } from "./PlayerKairoDataManager";
import type { KairoCommand } from "../utils/KairoUtils";
import { ScriptEventReceiver } from "./ScriptEventReceiver";
import type { PlayerKairoData } from "./PlayerKairoData";

export class SystemManager {
    private readonly systemEventManager: SystemEventManager;
    private readonly scriptEventReceiver: ScriptEventReceiver;
    private readonly playerKairoDataManager: PlayerKairoDataManager;

    private constructor(private readonly kairo: Kairo) {
        this.systemEventManager = SystemEventManager.create(this);
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

    public addOrRestorePlayerKairoData(player: Player) {
        this.playerKairoDataManager.addOrRestorePlayerKairoData(player);
    }

    public handleOnScriptEvent = (data: KairoCommand): void => {
        this.scriptEventReceiver.handleScriptEvent(data);
    };

    public getPlayerKairoData(playerId: string): PlayerKairoData {
        return this.playerKairoDataManager.getPlayerKairoData(playerId);
    }

    public getPlayersKairoData(): Map<string, PlayerKairoData> {
        return this.playerKairoDataManager.getPlayersKairoData();
    }
}
