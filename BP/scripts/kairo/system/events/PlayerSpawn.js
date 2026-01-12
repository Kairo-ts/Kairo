import { world } from "@minecraft/server";
import { BaseEventHandler } from "./BaseEventHandler";
export class PlayerSpawnHandler extends BaseEventHandler {
    constructor(systemEventManager) {
        super(systemEventManager);
        this.systemEventManager = systemEventManager;
        this.afterEvent = world.afterEvents.playerSpawn;
    }
    static create(systemEventManager) {
        return new PlayerSpawnHandler(systemEventManager);
    }
    handleAfter(ev) {
        const { initialSpawn, player } = ev;
        if (initialSpawn) {
            this.systemEventManager.getSystemManager().addOrRestorePlayerKairoData(player);
        }
    }
}
