export class VersionManager {
    static toVersionString(v) {
        let s = `${v.major}.${v.minor}.${v.patch}`;
        if (v.prerelease)
            s += `-${v.prerelease}`;
        if (v.build)
            s += `+${v.build}`;
        return s;
    }
    static toTriple(v) {
        return [v.major, v.minor, v.patch];
    }
    static fromString(ver) {
        const semverRegex = /^(?<major>\d+)\.(?<minor>\d+)\.(?<patch>\d+)(?:-(?<prerelease>[0-9A-Za-z.-]+))?(?:\+(?<build>[0-9A-Za-z.-]+))?$/;
        const m = semverRegex.exec(ver);
        if (!m || !m.groups) {
            throw new Error(`Invalid semver: ${ver}`);
        }
        // groups はここで非 undefined に絞られている
        const g = m.groups;
        return {
            major: parseInt(g.major, 10),
            minor: parseInt(g.minor, 10),
            patch: parseInt(g.patch, 10),
            prerelease: g.prerelease, // string | undefined でOK
            build: g.build, // string | undefined でOK
        };
    }
}
