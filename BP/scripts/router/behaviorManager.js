import { system } from "@minecraft/server";
import { BehaviorInitializeReceive } from "./init/behaviorInitializeReceive";
import { properties } from "../properties";
export class BehaviorManager {
    /**
     * ScriptEventReceiveに、BehaviorInitializeのハンドルを追加する
     * Add BehaviorInitialize handles to ScriptEventReceive
     */
    static initialize() {
        system.afterEvents.scriptEventReceive.subscribe((ev) => BehaviorInitializeReceive.handleScriptEventReceive(ev));
    }
    static getSelfAddonProperty() {
        return {
            name: properties.header.name,
            version: properties.header.version,
            dependencies: properties.dependencies,
            requiredAddons: properties.requiredAddons
        };
    }
}
