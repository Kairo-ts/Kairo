import { AddonRouter } from "./router/AddonRouter";
import { BehaviorManager } from "./router/behaviorManager";
import { BehaviorInitializePending } from "./router/init/behaviorInitializePending";
import { BehaviorInitializeRegister } from "./router/init/behaviorInitializeRegister";
async function main() {
    BehaviorManager.initialize();
    AddonRouter.initialize();
    await BehaviorInitializePending.ready;
    BehaviorInitializeRegister.registerAddon();
}
main();
