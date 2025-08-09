import { properties } from "../properties";
export class AddonPropertyManager {
    constructor(kairo) {
        this.kairo = kairo;
        this.charset = [...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'];
        this.self = {
            name: properties.header.name,
            sessionId: this.generateRandomId(8),
            version: properties.header.version,
            dependencies: properties.dependencies,
            requiredAddons: properties.requiredAddons
        };
    }
    static create(kairo) {
        return new AddonPropertyManager(kairo);
    }
    getSelfAddonProperty() {
        return this.self;
    }
    refreshSessionId() {
        this.self.sessionId = this.generateRandomId(8);
    }
    generateRandomId(length = 8) {
        return Array.from({ length }, () => this.charset[Math.floor(Math.random() * this.charset.length)]).join('');
    }
}
