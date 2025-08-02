import { system } from "@minecraft/server";
import { BehaviorInitializeReceive } from "./init/behaviorInitializeReceive";

export class BehaviorManager {
    static initialize() {
        system.afterEvents.scriptEventReceive.subscribe((ev) => BehaviorInitializeReceive.handleScriptEventReceive(ev));
    }
}