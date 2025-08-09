import { Kairo } from "./Kairo/index";
async function main() {
    Kairo.init(); // client
    Kairo.startRouter();
    await Kairo.pendingReady();
    Kairo.registerAddon();
}
main();
