import { properties } from "../properties";
export class AddonPropertyManager {
    static setSelfAddonProperty() {
        this.self = {
            name: properties.header.name,
            sessionId: this.generateRandomId(8),
            version: properties.header.version,
            dependencies: properties.dependencies,
            requiredAddons: properties.requiredAddons
        };
    }
    static getSelfAddonProperty() {
        return this.self;
    }
    static refreshSessionId() {
        this.self.sessionId = this.generateRandomId(8);
    }
    static generateRandomId(length = 8) {
        return Array.from({ length }, () => this.charset[Math.floor(Math.random() * this.charset.length)]).join('');
    }
}
AddonPropertyManager.charset = [...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'];
