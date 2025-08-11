import { system, world } from "@minecraft/server";
import { AddonInitializeReceive } from "./AddonInitializeReceive";
import { AddonInitializeRegister } from "./AddonInitializeRegister";
import { AddonInitializeRequest } from "./AddonInitializeRequest";
import { AddonInitializeResponse } from "./AddonInitializeResponse";
import { AddonRecord } from "../record/AddonRecord";
import type { Kairo } from "../..";
import type { AddonProperty } from "../AddonPropertyManager";

export class AddonInitializer {
    private registrationNum: number = 0;

    private readonly receive: AddonInitializeReceive;
    private readonly register: AddonInitializeRegister;
    private readonly request: AddonInitializeRequest;
    private readonly response: AddonInitializeResponse;
    private readonly record: AddonRecord;

    private constructor(private readonly kairo: Kairo) {
        this.receive = AddonInitializeReceive.create(this);
        this.register = AddonInitializeRegister.create(this);
        this.request = AddonInitializeRequest.create(this);
        this.response = AddonInitializeResponse.create(this);
        this.record = AddonRecord.create(this);
    }

    public static create(kairo: Kairo): AddonInitializer {
        return new AddonInitializer(kairo);
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

    public saveAddons(): void {
        this.record.saveAddons(this.register.getAll());
    }

    public getAddonRecords(): Record<string, { selectedVersion: string; versions: string[] }> {
        return this.record.loadAddons();
    }

    public getRegisteredAddons(): AddonProperty[] {
        return this.register.getAll();
    }
}