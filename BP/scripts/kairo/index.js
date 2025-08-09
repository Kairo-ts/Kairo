import { AddonPropertyManager } from "./AddonPropertyManager";
import { AddonRouter } from "./AddonRouter";
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
        inst.addonRouter.installHooks();
    }
    static initialize() {
        this.getInstance().addonRouter.initialize();
    }
    getSelfAddonProperty() {
        return this.addonPropertyManager.getSelfAddonProperty();
    }
    refreshSessionId() {
        this.addonPropertyManager.refreshSessionId();
    }
    static pendingReady() {
        return this.getInstance().addonRouter.getPendingReady();
    }
    static registerAddon() {
        return this.getInstance().addonRouter.requestRegisterAddon();
    }
}
