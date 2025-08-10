import type { AddonRouter } from "../../AddonRouter";

/**
 * 登録されたアドオンから、初期化時に有効化すべきアドオンを選定して、有効化するためのクラス
 * 
 * A class that selects, from the registered addons, those that should be enabled at initialization and enables them
 */
export class BehaviorInitializeActivator {
    private constructor(private readonly addonRouter: AddonRouter) {}
    public static create(addonRouter: AddonRouter): BehaviorInitializeActivator {
        return new BehaviorInitializeActivator(addonRouter);
    }
}