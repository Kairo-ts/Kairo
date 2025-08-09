import { Kairo } from "./Kairo";

async function main(): Promise<void> {
    Kairo.init(); // client
    Kairo.initialize();

    await Kairo.pendingReady();
    Kairo.registerAddon();
}

main();