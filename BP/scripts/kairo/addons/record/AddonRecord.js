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
            const { name, version } = addon;
            const vStr = VersionManager.toVersionString(version);
            if (!addonRecords[name]) {
                addonRecords[name] = {
                    description: ["0.0.0", ""],
                    selectedVersion: "latest version",
                    versions: []
                };
            }
            if (VersionManager.compare(addonRecords[name].description[0], vStr) === -1) {
                addonRecords[name].description[0] = vStr;
                addonRecords[name].description[1] = addon.description;
            }
            addonRecords[name].versions.push(vStr);
        });
        DynamicPropertyStorage.save("AddonRecords", addonRecords);
    }
    loadAddons() {
        return DynamicPropertyStorage.load("AddonRecords");
    }
}
