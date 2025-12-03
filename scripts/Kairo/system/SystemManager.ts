import type { Kairo } from "..";
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
}
