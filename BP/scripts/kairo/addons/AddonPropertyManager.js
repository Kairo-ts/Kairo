import { properties } from "../../properties";
import { KairoUtils } from "../utils/KairoUtils";
export class AddonPropertyManager {
    constructor(kairo) {
        this.kairo = kairo;
        this.self = {
            id: properties.id,
            name: properties.header.name,
            description: properties.header.description,
            sessionId: KairoUtils.generateRandomId(8),
            version: properties.header.version,
            dependencies: properties.dependencies,
            requiredAddons: properties.requiredAddons,
            tags: properties.tags,
        };
    }
    static create(kairo) {
        return new AddonPropertyManager(kairo);
    }
    getSelfAddonProperty() {
        return this.self;
    }
    refreshSessionId() {
        this.self.sessionId = KairoUtils.generateRandomId(8);
    }
}
