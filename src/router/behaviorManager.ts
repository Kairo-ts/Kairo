import { system } from "@minecraft/server";
import { BehaviorInitializeReceive } from "./init/behaviorInitializeReceive";

export class BehaviorManager {
    static initialize() {
        system.afterEvents.scriptEventReceive.subscribe(BehaviorInitializeReceive.handleScriptEventReceive);
    }
}