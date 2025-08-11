import { AddonActivator } from "./AddonActivator";
export class AddonManager {
    constructor(kairo) {
        this.kairo = kairo;
        this.addonsData = new Map();
        this.activator = AddonActivator.create(this);
    }
    static create(kairo) {
        return new AddonManager(kairo);
    }
    activateAddons(addons) {
        this.activator.activateAddons(addons);
    }
    getAddonsData() {
        return this.addonsData;
    }
    getAddonRecords() {
        return this.kairo.getAddonRecords();
    }
}
