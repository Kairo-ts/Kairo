import { system } from "@minecraft/server";
import { AddonPropertyManager, type AddonProperty } from "./AddonPropertyManager";
import { AddonRouter } from "./AddonRouter";
import { SCRIPT_EVENT_IDS } from "./constants";
import { AddonManager } from "./AddonManager";
import type { AddonRecords } from "./router/record/AddonRecord";

export class Kairo {
    private static instance: Kairo;
    private initialized = false;

    private readonly addonManager: AddonManager;
    private readonly addonPropertyManager: AddonPropertyManager;
    private readonly addonRouter: AddonRouter;

    private constructor() {
        this.addonManager = AddonManager.create(this);
        this.addonPropertyManager = AddonPropertyManager.create(this);
        this.addonRouter = AddonRouter.create(this);
    }

    private static getInstance(): Kairo {
        if (!this.instance) {
            this.instance = new Kairo();
        }
        return this.instance;
    }

    public static init(): void {
        const inst = this.getInstance();
        if (inst.initialized) return;

        inst.initialized = true;
        inst.addonRouter.subscribeClientHooks();
    }

    public static initRouter(): void {
        this.getInstance().addonRouter.subscribeCoreHooks();
    }

    public getSelfAddonProperty(): AddonProperty {
        return this.addonPropertyManager.getSelfAddonProperty();
    }

    public refreshSessionId(): void {
        this.addonPropertyManager.refreshSessionId();
    }

    public static awaitRegistration(): Promise<void> {
        return this.getInstance().addonRouter.awaitRegistration();
    }

    public static unsubscribeInitializeHooks(): void {
        this.getInstance().addonRouter.unsubscribeClientHooks();
        system.sendScriptEvent(SCRIPT_EVENT_IDS.UNSUBSCRIBE_INITIALIZE, "");
    }

    public static initSaveAddons(): void {
        this.getInstance().addonRouter.saveAddons();
    }

    public static initActivateAddons(): void {
        const inst = this.getInstance();
        inst.addonManager.activateAddons(inst.addonRouter.getRegisteredAddons());
    }

    public getAddonRecords(): AddonRecords {
        return this.addonRouter.getAddonRecords();
    }
}