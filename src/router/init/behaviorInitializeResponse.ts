import { system } from "@minecraft/server";
import { properties } from "../../properties";

export class BehaviorInitializeResponse {
    static sendResponse(): void {
        system.sendScriptEvent("router:initializeResponse", this.serializeForTransmission());
    }

    private static serializeForTransmission(): string {
        return JSON.stringify(
            {
                name: properties.header.name,
                version: properties.header.version,
                dependencies: properties.dependencies,
                requiredAddons: properties.requiredAddons
            }
        );
    }
}