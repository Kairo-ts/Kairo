import { properties } from "../../properties";

export class ConsoleManager {
    private static getJstTimestamp(): string {
        const now = new Date();
        return now.toLocaleString("ja-JP", {
            timeZone: "Asia/Tokyo",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
    }

    static log(message: string): void {
        console.log(`[${properties.header.name}][${this.getJstTimestamp()}][Log] ${message}`);
    }

    static warn(message: string): void {
        console.warn(`[${properties.header.name}][${this.getJstTimestamp()}][Warning] ${message}`);
    }

    static error(message: string): void {
        console.error(`[${properties.header.name}][${this.getJstTimestamp()}][Error] ${message}`);
    }
}
