import { DynamicPropertyStorage } from "./DynamicPropertyStorage";
import { VERSION_KEYWORDS } from "../../constants/version_keywords";
import { STORAGE_KEYWORDS } from "../../constants/storage";
import { VersionManager } from "../../utils/VersionManager";
export class AddonRecord {
    constructor(addonInitializer) {
        this.addonInitializer = addonInitializer;
    }
    static create(addonInitializer) {
        return new AddonRecord(addonInitializer);
    }
    saveAddon(addonData) {
        const addonRecords = this.loadAddons();
        const { id, name } = addonData;
        if (!addonRecords[id]) {
            addonRecords[id] = {
                name: name,
                description: ["0.0.0", ""],
                selectedVersion: VERSION_KEYWORDS.LATEST,
                versions: Object.keys(addonData?.versions),
                isActive: true,
            };
        }
        addonRecords[id].description = addonData.description;
        addonRecords[id].selectedVersion = addonData.selectedVersion;
        addonRecords[id].isActive = addonData.isActive;
        DynamicPropertyStorage.save(STORAGE_KEYWORDS.ADDON_RECORDS, addonRecords);
    }
    saveAddons(addons) {
        const addonRecords = this.loadAddons();
        addons.forEach((addon) => {
            const { id, name, version } = addon;
            const vStr = VersionManager.toVersionString(version);
            if (!addonRecords[id]) {
                addonRecords[id] = {
                    name: name,
                    description: ["0.0.0", ""],
                    selectedVersion: VERSION_KEYWORDS.LATEST,
                    versions: [],
                    isActive: true,
                };
            }
            if (VersionManager.compare(addonRecords[id].description[0], vStr) === -1) {
                addonRecords[id].description[0] = vStr;
                addonRecords[id].description[1] = addon.description;
            }
            addonRecords[id].versions.push(vStr);
        });
        DynamicPropertyStorage.save(STORAGE_KEYWORDS.ADDON_RECORDS, addonRecords);
    }
    loadAddons() {
        return DynamicPropertyStorage.load(STORAGE_KEYWORDS.ADDON_RECORDS);
    }
}
