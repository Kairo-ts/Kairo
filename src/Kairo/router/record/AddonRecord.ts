import { world } from "@minecraft/server";
import type { AddonProperty } from "../../AddonPropertyManager";
import type { AddonRouter } from "../../AddonRouter";
import { VersionManager } from "../../../utils/versionManager";

interface AddonRecords {
    [name: string]: {
        selectedVersion: string;
        versions: {
            [version: string]: string[];
        }
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
                addonRecords[name] = { selectedVersion: "latest version", versions: {} };
            }
            addonRecords[name].versions[vStr] = tags;
        });

        world.setDynamicProperty("AddonRecords", JSON.stringify(addonRecords));
    }

    public loadAddons(): AddonRecords {
        return JSON.parse(world.getDynamicProperty("AddonRecords") as string || "{}") as AddonRecords;
    }
}