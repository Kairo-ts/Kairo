import { AddonPropertyManager, type AddonProperty } from "./AddonPropertyManager";
import { AddonRouter } from "./AddonRouter";

export class Kairo {
    private static instance: Kairo;
    private initialized = false;

    private readonly addonPropertyManager: AddonPropertyManager;
    private readonly addonRouter: AddonRouter;

    private constructor() {
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
        inst.addonRouter.installHooks();
    }

    public static initialize(): void {
        this.getInstance().addonRouter.initialize();
    }

    public getSelfAddonProperty(): AddonProperty {
        return this.addonPropertyManager.getSelfAddonProperty();
    }

    public refreshSessionId(): void {
        this.addonPropertyManager.refreshSessionId();
    }

    public static pendingReady(): Promise<void> {
        return this.getInstance().addonRouter.getPendingReady();
    }

    public static registerAddon(): void {
        return this.getInstance().addonRouter.requestRegisterAddon();
    }
}