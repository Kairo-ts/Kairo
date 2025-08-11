/**
 * 登録されたアドオンから、初期化時に有効化すべきアドオンを選定して、有効化するためのクラス
 *
 * A class that selects, from the registered addons, those that should be enabled at initialization and enables them
 */
export class BehaviorInitializeActivator {
    constructor(addonRouter) {
        this.addonRouter = addonRouter;
    }
    static create(addonRouter) {
        return new BehaviorInitializeActivator(addonRouter);
    }
    activateAddons(addons) {
    }
}
