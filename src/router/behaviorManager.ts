import { system } from "@minecraft/server";
import { BehaviorInitializeReceive } from "./init/behaviorInitializeReceive";

export class BehaviorManager {
    /**
     * ScriptEventReceiveに、BehaviorInitializeのハンドルを追加する
     * Add BehaviorInitialize handles to ScriptEventReceive
     */
    static initialize() {
        system.afterEvents.scriptEventReceive.subscribe((ev) => BehaviorInitializeReceive.handleScriptEventReceive(ev));
    }
}