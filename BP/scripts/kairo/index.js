import { system } from "@minecraft/server";
import { AddonPropertyManager } from "./AddonPropertyManager";
import { AddonRouter } from "./AddonRouter";
import { SCRIPT_EVENT_IDS } from "./constants";
export class Kairo {
    constructor() {
        this.initialized = false;
        this.addonPropertyManager = AddonPropertyManager.create(this);
        this.addonRouter = AddonRouter.create(this);
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new Kairo();
        }
        return this.instance;
    }
    static init() {
        const inst = this.getInstance();
        if (inst.initialized)
            return;
        inst.initialized = true;
        inst.addonRouter.subscribeClientHooks();
    }
    static initRouter() {
        this.getInstance().addonRouter.subscribeCoreHooks();
    }
    getSelfAddonProperty() {
        return this.addonPropertyManager.getSelfAddonProperty();
    }
    refreshSessionId() {
        this.addonPropertyManager.refreshSessionId();
    }
    static awaitRegistration() {
        return this.getInstance().addonRouter.awaitRegistration();
    }
    static unsubscribeInitializeHooks() {
        this.getInstance().addonRouter.unsubscribeClientHooks();
        system.sendScriptEvent(SCRIPT_EVENT_IDS.UNSUBSCRIBE_INITIALIZE, "");
    }
}
