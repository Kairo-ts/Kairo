import { system, world } from "@minecraft/server";
import { BehaviorInitializeActivator } from "./router/init/behaviorInitializeActivator";
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
    private registrationNum: number = 0;

    private readonly activator: BehaviorInitializeActivator;
    private readonly receive: BehaviorInitializeReceive;
    private readonly register: BehaviorInitializeRegister;
    private readonly request: BehaviorInitializeRequest;
    private readonly response: BehaviorInitializeResponse;

    private constructor(private readonly kairo: Kairo) {
        this.activator = BehaviorInitializeActivator.create(this);
        this.receive = BehaviorInitializeReceive.create(this);
        this.register = BehaviorInitializeRegister.create(this);
        this.request = BehaviorInitializeRequest.create(this);
        this.response = BehaviorInitializeResponse.create(this);
    }

    public static create(kairo: Kairo): AddonRouter {
        return new AddonRouter(kairo);
    }

    public subscribeClientHooks() {
        system.afterEvents.scriptEventReceive.subscribe(this.receive.handleScriptEvent);
    }

    public unsubscribeClientHooks() {
        system.afterEvents.scriptEventReceive.unsubscribe(this.receive.handleScriptEvent);
    }

    public getSelfAddonProperty(): AddonProperty {
        return this.kairo.getSelfAddonProperty();
    }

    public refreshSessionId(): void {
        return this.kairo.refreshSessionId();
    }

    public sendResponse(): void {
        const selfAddonProperty = this.getSelfAddonProperty();
        this.response.sendResponse(selfAddonProperty);
    }

    public setRegistrationNum(num: number): void {
        this.registrationNum = num;
    }

    public getRegistrationNum(): number {
        return this.registrationNum;
    }

    /**
     * WorldLoadとScriptEventReceiveに、BehaviorInitializeのハンドルを追加する
     * Add BehaviorInitialize handles to WorldLoad and ScriptEventReceive
     */
    public subscribeCoreHooks() {
        world.afterEvents.worldLoad.subscribe(this.request.handleWorldLoad);
        system.afterEvents.scriptEventReceive.subscribe(this.register.handleScriptEventReceive);
    }

    public unsubscribeCoreHooks() {
        world.afterEvents.worldLoad.unsubscribe(this.request.handleWorldLoad);
        system.afterEvents.scriptEventReceive.unsubscribe(this.register.handleScriptEventReceive);
    }

    public getAllPendingAddons(): AddonProperty[] {
        return this.register.getAll();
    }

    public awaitRegistration(): Promise<void> {
        return this.register.ready;
    }
}