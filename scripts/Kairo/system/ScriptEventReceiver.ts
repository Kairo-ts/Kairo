import { properties } from "../../properties";
import { SCRIPT_EVENT_COMMAND_IDS } from "../constants/scriptevent";
import { KairoUtils, type KairoCommand } from "../utils/KairoUtils";
import type { SystemManager } from "./SystemManager";

export class ScriptEventReceiver {
    private constructor(private readonly systemManager: SystemManager) {}
    public static create(systemManager: SystemManager): ScriptEventReceiver {
        return new ScriptEventReceiver(systemManager);
    }

    public handleScriptEvent(data: KairoCommand): void {
        switch (data.commandId) {
            case SCRIPT_EVENT_COMMAND_IDS.GET_PLAYER_KAIRO_DATA:
                KairoUtils.sendKairoCommand(data.addonId, {
                    commandId: SCRIPT_EVENT_COMMAND_IDS.GET_PLAYER_KAIRO_DATA_RESPONSE,
                    addonId: properties.id,
                    value: this.systemManager.getPlayerKairoData(data.playerId),
                });
                break;
            case SCRIPT_EVENT_COMMAND_IDS.GET_PLAYERS_KAIRO_DATA:
                KairoUtils.sendKairoCommand(data.addonId, {
                    commandId: SCRIPT_EVENT_COMMAND_IDS.GET_PLAYERS_KAIRO_DATA_RESPONSE,
                    addonId: properties.id,
                    value: this.systemManager.getPlayersKairoData(),
                });
                break;
        }
    }
}
