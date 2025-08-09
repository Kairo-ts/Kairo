import { ScriptEventCommandMessageAfterEvent, system, world, WorldLoadAfterEvent } from "@minecraft/server";
import { BehaviorInitializePending } from "./router/init/behaviorInitializePending";
import type { Kairo } from ".";
import { BehaviorInitializeReceive } from "./router/init/behaviorInitializeReceive";
import { BehaviorInitializeRegister } from "./router/init/behaviorInitializeRegister";
import { BehaviorInitializeRequest } from "./router/init/behaviorInitializeRequest";
import { BehaviorInitializeResponse } from "./router/init/behaviorInitializeResponse";

/**
 * Werewolf-AddonRouterの中枢となるクラス
 * The core class of Werewolf-AddonRouter
 */
export class AddonRouter {
    private readonly pending: BehaviorInitializePending;
    private readonly receive: BehaviorInitializeReceive;
    private readonly register: BehaviorInitializeRegister;
    private readonly request: BehaviorInitializeRequest;
    private readonly response: BehaviorInitializeResponse;

    private constructor(private readonly kairo: Kairo) {
        this.pending = BehaviorInitializePending.create(this);
        this.receive = BehaviorInitializeReceive.create(this);
        this.register = BehaviorInitializeRegister.create(this);
        this.request = BehaviorInitializeRequest.create(this);
        this.response = BehaviorInitializeResponse.create(this);
    }

    public static create(kairo: Kairo): AddonRouter {
        return new AddonRouter(kairo);
    }

    public clientInitialize() {
        system.afterEvents.scriptEventReceive.subscribe((ev: ScriptEventCommandMessageAfterEvent) => {
            this.receiveHandleScriptEvent(ev);
        });
    }

    private receiveHandleScriptEvent(ev: ScriptEventCommandMessageAfterEvent): void {

    }

    /**
     * WolrdLoadとScriptEventReceiveに、BehaviorInitializeのハンドルを追加する
     * Add BehaviorInitialize handles to WorldLoad and ScriptEventReceive
     */
    public initialize() {
        world.afterEvents.worldLoad.subscribe((ev: WorldLoadAfterEvent) => {
            this.requestHandleWorldLoad(ev);
        });

        system.afterEvents.scriptEventReceive.subscribe((ev: ScriptEventCommandMessageAfterEvent) => {
            this.pendingHandleScriptEventReceive(ev);
        });
    }

    private requestHandleWorldLoad(ev: WorldLoadAfterEvent): void {

    }

    private pendingHandleScriptEventReceive(ev: ScriptEventCommandMessageAfterEvent): void {

    }
    //public initialize() {
    //    world.afterEvents.worldLoad.subscribe((ev) => BehaviorInitializeRequest.handleWorldLoad(ev));
    //    system.afterEvents.scriptEventReceive.subscribe((ev) => BehaviorInitializePending.handleScriptEventReceive(ev));
    //}
}