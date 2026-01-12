import { BaseEventManager } from "./BaseEventManager";
import { PlayerSpawnHandler } from "./PlayerSpawn";
export class SystemEventManager extends BaseEventManager {
    constructor(systemManager) {
        super();
        this.systemManager = systemManager;
        this.playerSpawn = PlayerSpawnHandler.create(this);
    }
    static create(systemManager) {
        return new SystemEventManager(systemManager);
    }
    subscribeAll() {
        this.playerSpawn.subscribe();
    }
    unsubscribeAll() {
        this.playerSpawn.unsubscribe();
    }
    getSystemManager() {
        return this.systemManager;
    }
}
