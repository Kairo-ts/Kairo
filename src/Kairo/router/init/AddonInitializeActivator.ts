import type { AddonProperty } from "../../AddonPropertyManager";
import type { AddonRouter } from "../../AddonRouter";

/**
 * 登録されたアドオンから、初期化時に有効化すべきアドオンを選定して、有効化するためのクラス
 * 
 * A class that selects, from the registered addons, those that should be enabled at initialization and enables them
 */
export class AddonInitializeActivator {
    private constructor(private readonly addonRouter: AddonRouter) {}
    public static create(addonRouter: AddonRouter): AddonInitializeActivator {
        return new AddonInitializeActivator(addonRouter);
    }

    public activateAddons(addons: AddonProperty[]): void {
        const addonRecords = this.addonRouter.getAddonRecords();

        Object.entries(addonRecords).forEach(([name, record]) => {
            this.addonRouter.initAddonData(name, record.selectedVersion, record.versions);
        });
    }
}