import { ScriptEventCommandMessageAfterEvent, system, world, WorldLoadAfterEvent } from "@minecraft/server";
import { BehaviorInitializePending } from "./router/init/behaviorInitializePending";
import { BehaviorInitializeReceive } from "./router/init/behaviorInitializeReceive";
import { BehaviorInitializeRegister } from "./router/init/behaviorInitializeRegister";
import { BehaviorInitializeRequest } from "./router/init/behaviorInitializeRequest";
import { BehaviorInitializeResponse } from "./router/init/behaviorInitializeResponse";
import type { Kairo } from ".";
import type { AddonProperty } from "./AddonPropertyManager";

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

    public installHooks() {
        system.afterEvents.scriptEventReceive.subscribe((ev: ScriptEventCommandMessageAfterEvent) => {
            this.receive.handleScriptEvent(ev);
        });
    }

    public requestGetSelfAddonProperty(): AddonProperty {
        return this.kairo.getSelfAddonProperty();
    }

    public requestRefreshSessionId(): void {
        return this.kairo.refreshSessionId();
    }

    public requestSendResponse(): void {
        const selfAddonProperty = this.requestGetSelfAddonProperty();
        this.response.sendResponse(selfAddonProperty);
    }

    /**
     * WolrdLoadとScriptEventReceiveに、BehaviorInitializeのハンドルを追加する
     * Add BehaviorInitialize handles to WorldLoad and ScriptEventReceive
     */
    public initialize() {
        world.afterEvents.worldLoad.subscribe((ev: WorldLoadAfterEvent) => {
            this.request.handleWorldLoad(ev);
        });

        system.afterEvents.scriptEventReceive.subscribe((ev: ScriptEventCommandMessageAfterEvent) => {
            this.pending.handleScriptEventReceive(ev);
        });
    }

    public requestGetAllPendingAddons(): AddonProperty[] {
        return this.pending.getAll();
    }

    public getPendingReady(): Promise<void> {
        return this.pending.ready;
    }

    public requestRegisterAddon(): void {
        this.register.registerAddon();
    }
}