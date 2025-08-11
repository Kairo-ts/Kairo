import type { AddonProperty } from "../../AddonPropertyManager";
import type { AddonRouter } from "../../AddonRouter";
import { VersionManager } from "../../../utils/versionManager";
import { DynamicPropertyStorage } from "./DynamicPropertyStorage";

interface AddonRecords {
    [name: string]: {
        selectedVersion: string;
        versions: string[]
    };
}

export class AddonRecord {
    private constructor(private readonly addonRouter: AddonRouter) {}

    public static create(addonRouter: AddonRouter): AddonRecord {
        return new AddonRecord(addonRouter);
    }

    public saveAddons(addons: AddonProperty[]): void {
        const addonRecords: AddonRecords = this.loadAddons();

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

    public loadAddons(): AddonRecords {
        return DynamicPropertyStorage.load("AddonRecords") as AddonRecords;
    }
}