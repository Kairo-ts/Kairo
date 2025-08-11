import type { SemVer } from "../properties";

export class VersionManager {
    public static toVersionString(v: SemVer): string {
        let s = `${v.major}.${v.minor}.${v.patch}`;
        if (v.prerelease) s += `-${v.prerelease}`;
        if (v.build) s += `+${v.build}`;
        return s;
    }
}