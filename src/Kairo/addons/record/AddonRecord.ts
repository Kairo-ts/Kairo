import type { AddonProperty } from "../AddonPropertyManager";
import type { AddonInitializer } from "../init/AddonInitializer";
import { VersionManager } from "../../../utils/versionManager";
import { DynamicPropertyStorage } from "./DynamicPropertyStorage";

export interface AddonRecords {
    [name: string]: {
        description: [string, string];
        selectedVersion: string;
        versions: string[]
    };
}

export class AddonRecord {
    private constructor(private readonly addonInitializer: AddonInitializer) {}

    public static create(addonInitializer: AddonInitializer): AddonRecord {
        return new AddonRecord(addonInitializer);
    }

    public saveAddons(addons: AddonProperty[]): void {
        const addonRecords: AddonRecords = this.loadAddons();

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

    public loadAddons(): AddonRecords {
        return DynamicPropertyStorage.load("AddonRecords") as AddonRecords;
    }
}