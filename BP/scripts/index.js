import { Kairo } from "./Kairo";
async function main() {
    Kairo.init(); // client
    Kairo.initialize();
    await Kairo.pendingReady();
    Kairo.registerAddon();
}
main();
