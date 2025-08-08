import { system } from "@minecraft/server";
import { BehaviorInitializeReceive } from "./router/init/behaviorInitializeReceive";
import { AddonPropertyManager } from "./AddonProperty";
import type { Kairo } from ".";

export class BehaviorManager {
    private constructor(private readonly kairo: Kairo) {}
    public static create(kairo: Kairo): BehaviorManager {
        return new BehaviorManager(kairo);
    }

    /**
     * ScriptEventReceiveに、BehaviorInitializeのハンドルを追加する
     * Add BehaviorInitialize handles to ScriptEventReceive
     */
    initialize() {
        system.afterEvents.scriptEventReceive.subscribe((ev) => BehaviorInitializeReceive.handleScriptEventReceive(ev));
        AddonPropertyManager.setSelfAddonProperty();
    }
}