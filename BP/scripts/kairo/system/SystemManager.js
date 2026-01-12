import { DEFAULT_KAIRO_STATES } from "../constants/states";
import { SystemEventManager } from "./events/SystemEventManager";
import { PlayerKairoDataManager } from "./PlayerKairoDataManager";
import { ScriptEventReceiver } from "./ScriptEventReceiver";
export class SystemManager {
    constructor(kairo) {
        this.kairo = kairo;
        this.handleOnScriptEvent = (data) => {
            this.scriptEventReceiver.handleScriptEvent(data);
        };
        this.systemEventManager = SystemEventManager.create(this);
        this.scriptEventReceiver = ScriptEventReceiver.create(this);
        this.playerKairoDataManager = PlayerKairoDataManager.create(this, DEFAULT_KAIRO_STATES);
    }
    static create(kairo) {
        return new SystemManager(kairo);
    }
    initialize() {
        this.playerKairoDataManager.init();
    }
    subscribeEvents() {
        this.systemEventManager.subscribeAll();
    }
    unsubscribeEvents() {
        this.systemEventManager.unsubscribeAll();
    }
    addOrRestorePlayerKairoData(player) {
        this.playerKairoDataManager.addOrRestorePlayerKairoData(player);
    }
    getPlayerKairoData(playerId) {
        return this.playerKairoDataManager.getPlayerKairoData(playerId);
    }
    getPlayersKairoData() {
        return this.playerKairoDataManager.getPlayersKairoData();
    }
}
