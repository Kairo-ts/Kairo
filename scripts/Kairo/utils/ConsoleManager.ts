import { properties } from "../../properties";

export class ConsoleManager {
    static log(message: string): void {
        console.log(`[${properties.header.name}][Log] ${message}`);
    }

    static warn(message: string): void {
        console.warn(`[${properties.header.name}][Warning] ${message}`);
    }

    static error(message: string): void {
        console.error(`[${properties.header.name}][Error] ${message}`);
    }
}