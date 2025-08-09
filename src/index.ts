import { Kairo } from "./Kairo/index";

async function main(): Promise<void> {
    Kairo.init(); // client
    Kairo.startRouter();

    await Kairo.pendingReady();
    Kairo.registerAddon();
}

main();