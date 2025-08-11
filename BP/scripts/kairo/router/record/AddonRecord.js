export class AddonRecord {
    constructor(addonRouter) {
        this.addonRouter = addonRouter;
    }
    static create(addonRouter) {
        return new AddonRecord(addonRouter);
    }
    saveAddons(addons) {
    }
}
