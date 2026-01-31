import { SCRIPT_EVENT_COMMAND_TYPES } from "../constants/scriptevent";
import { KairoUtils, } from "../utils/KairoUtils";
export class ScriptEventReceiver {
    constructor(systemManager) {
        this.systemManager = systemManager;
    }
    static create(systemManager) {
        return new ScriptEventReceiver(systemManager);
    }
    async handleScriptEvent(command) {
        switch (command.commandType) {
            case SCRIPT_EVENT_COMMAND_TYPES.GET_PLAYER_KAIRO_DATA: {
                const playerId = command.data.playerId;
                const playerKairoData = await this.systemManager.getPlayerKairoData(playerId);
                const playerKairoDataDTO = {
                    playerId,
                    joinOrder: playerKairoData.getJoinOrder(),
                    states: playerKairoData.getStates(),
                };
                return KairoUtils.buildKairoResponse({
                    playerKairoData: playerKairoDataDTO,
                });
            }
            case SCRIPT_EVENT_COMMAND_TYPES.GET_PLAYERS_KAIRO_DATA: {
                const playersKairoData = await this.systemManager.getPlayersKairoData();
                const playersKairoDataDTO = Array.from(playersKairoData.entries()).map(([playerId, kairoData]) => ({
                    playerId,
                    joinOrder: kairoData.getJoinOrder(),
                    states: kairoData.getStates(),
                }));
                return KairoUtils.buildKairoResponse({
                    playersKairoData: playersKairoDataDTO,
                });
            }
            default:
                return;
        }
    }
}
