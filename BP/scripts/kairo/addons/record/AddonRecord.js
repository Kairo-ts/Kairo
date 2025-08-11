import { VersionManager } from "../../../utils/versionManager";
import { DynamicPropertyStorage } from "./DynamicPropertyStorage";
export class AddonRecord {
    constructor(addonInitializer) {
        this.addonInitializer = addonInitializer;
    }
    static create(addonInitializer) {
        return new AddonRecord(addonInitializer);
    }
    saveAddons(addons) {
        const addonRecords = this.loadAddons();
        addons.forEach(addon => {
            const { name, version, tags } = addon;
            const vStr = VersionManager.toVersionString(version);
            if (!addonRecords[name]) {
                addonRecords[name] = { selectedVersion: "latest version", versions: [] };
            }
            addonRecords[name].versions.push(vStr);
        });
        DynamicPropertyStorage.save("AddonRecords", addonRecords);
    }
    loadAddons() {
        return DynamicPropertyStorage.load("AddonRecords");
    }
}
