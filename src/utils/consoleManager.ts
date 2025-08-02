export class ConsoleManager {
    static log(message: string): void {
        console.log(`[Werewolf][Log] ${message}`);
    }

    static warn(message: string): void {
        console.warn(`[Werewolf][Warning] ${message}`);
    }

    static error(message: string): void {
        console.error(`[Werewolf][ERROR] ${message}`);
    }

    static info(tag: string = "Info", message: string): void {
        console.log(`[Werewolf][${tag}] ${message}`);
    }
}