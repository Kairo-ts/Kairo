import { AddonRouter } from "./kairo/router/AddonRouter";
import { BehaviorManager } from "./kairo/router/init/behaviorManager";
import { BehaviorInitializePending } from "./kairo/router/init/behaviorInitializePending";
import { BehaviorInitializeRegister } from "./kairo/router/init/behaviorInitializeRegister";

async function main(): Promise<void> {
    BehaviorManager.initialize();
    AddonRouter.initialize();

    await BehaviorInitializePending.ready;
    BehaviorInitializeRegister.registerAddon();
}

main();