import type { Kairo } from ".";

export class AddonManager {
    private constructor(private readonly kairo: Kairo) {}
    public static create(kairo: Kairo): AddonManager {
        return new AddonManager(kairo);
    }
}