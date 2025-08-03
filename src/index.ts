import { AddonRouter } from "./router/AddonRouter";
import { BehaviorManager } from "./router/behaviorManager";
import { BehaviorInitializePending } from "./router/init/behaviorInitializePending";

async function main(): Promise<void> {
    BehaviorManager.initialize();
    AddonRouter.initialize();

    await BehaviorInitializePending.ready;
    console.log(BehaviorInitializePending.getAll());
}

main();