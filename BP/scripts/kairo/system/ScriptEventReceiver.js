import { SCRIPT_EVENT_COMMAND_TYPES } from "../constants/scriptevent";
import { KairoUtils } from "../utils/KairoUtils";
export class ScriptEventReceiver {
    constructor(systemManager) {
        this.systemManager = systemManager;
    }
    static create(systemManager) {
        return new ScriptEventReceiver(systemManager);
    }
    async handleScriptEvent(command) {
        switch (command.commandType) {
            case SCRIPT_EVENT_COMMAND_TYPES.GET_PLAYER_KAIRO_DATA:
                const playerId = command.data.playerId;
                const playerKairoData = this.systemManager.getPlayerKairoData(playerId);
                return KairoUtils.buildKairoResponse({ playerKairoData });
            case SCRIPT_EVENT_COMMAND_TYPES.GET_PLAYERS_KAIRO_DATA:
                const playersKairoData = this.systemManager.getPlayersKairoData();
                return KairoUtils.buildKairoResponse({ playersKairoData });
            default:
                return;
        }
    }
}
