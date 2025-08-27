import type { AddonInitializer } from "./AddonInitializer";

export class AddonInitializeActivator {
    private constructor(private readonly addonInitializer: AddonInitializer) {}

    public static create(addonInitializer: AddonInitializer): AddonInitializeActivator {
        return new AddonInitializeActivator(addonInitializer);
    }
}