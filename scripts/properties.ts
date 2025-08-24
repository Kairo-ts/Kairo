/**
 * scripts/properties から manifest.jsonを自動生成する
 * propertiesは、アドオン間通信においても、識別などに利用する
 */

export type SemVer = {
    major: number; minor: number; patch: number;
    prerelease?: string | undefined; // "preview.3" / "rc.1"
    build?: string | undefined;      // "abc123" (commit)
};

export const properties = {
    id: "kairo", // a-z & 0-9 - _
    metadata: { 
        /** 製作者の名前 */
        authors: [
            "shizuku86"
        ]
    },
    header: {
        name: "Kairo",
        description: "Enables communication between multiple behavior packs by leveraging the ScriptAPI as a communication layer.",
        version: { 
            major: 1, 
            minor: 0, 
            patch: 0,
            prerelease: "dev.34",
            // build: "abc123",
        },
        min_engine_version: [ 1,21,100 ],
        uuid: "45826daa-bf9f-4443-b746-944a0970bfef"
    },
    resourcepack: {
        name: "Use BP Name",
        description: "Use BP Description",
        uuid: "5586bc68-ca19-4d34-9b8d-0cf522ff421d",
        module_uuid: "f9cf1b9e-5d91-477a-b9d8-b1cc6f64c335",
    },
    modules: [
        {
            type: "script",
			language: "javascript",
			entry: "scripts/index.js",
            version: "header.version",
            uuid: "1d3bfdf2-7456-435b-bacf-c94c0d7b7c64"
        }
    ],
    dependencies: [
		{
			module_name: "@minecraft/server",
			version: "2.1.0"
		},
		{
			module_name: "@minecraft/server-ui",
			version: "2.0.0"
		}
	],
    /** 前提アドオン */
    requiredAddons: {
        /**
         * id: version (string) // "kairo": "1.0.0"
         */
    },
    tags: [
        "official",
        "stable",
    ],
}

export const supportedTags: string[] = [
    "official",
    "approved",
    "stable",
    "experimental"
]