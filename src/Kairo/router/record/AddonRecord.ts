import type { AddonRouter } from "../../AddonRouter";

export class AddonRecord {
    private constructor(private readonly addonRouter: AddonRouter) {}

    public static create(addonRouter: AddonRouter): AddonRecord {
        return new AddonRecord(addonRouter);
    }
}