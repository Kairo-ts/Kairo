import { VersionManager } from "../../../utils/versionManager";
import { DynamicPropertyStorage } from "./DynamicPropertyStorage";
export class AddonRecord {
    constructor(addonRouter) {
        this.addonRouter = addonRouter;
    }
    static create(addonRouter) {
        return new AddonRecord(addonRouter);
    }
    saveAddons(addons) {
        const addonRecords = this.loadAddons();
        addons.forEach(addon => {
            const { name, version, tags } = addon;
            const vStr = VersionManager.toVersionString(version);
            if (!addonRecords[name]) {
                addonRecords[name] = { selectedVersion: "latest version", versions: {} };
            }
            addonRecords[name].versions[vStr] = tags;
        });
        DynamicPropertyStorage.save("AddonRecords", addonRecords);
    }
    loadAddons() {
        return DynamicPropertyStorage.load("AddonRecords");
    }
}
