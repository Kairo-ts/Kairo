import type { AddonProperty } from "../../AddonPropertyManager";
import type { AddonRouter } from "../../AddonRouter";

export class AddonRecord {
    private constructor(private readonly addonRouter: AddonRouter) {}

    public static create(addonRouter: AddonRouter): AddonRecord {
        return new AddonRecord(addonRouter);
    }

    public saveAddons(addons: AddonProperty[]): void {
        
    }
}