/// <reference types="@types/node" />

declare class Version {
    constructor(pkg: Package, opt: any);

    public readonly dependencies: Registry.Dependencies;
    public readonly devDependencies: Registry.Dependencies;
    public readonly npmVersion: string;
    public readonly nodeVersion: string;
    public readonly npmUser: Registry.Human;
    public readonly maintainers: Registry.Human[];
    public readonly dist: Registry.Dist;
}

declare class Package {
    constructor(opt: any);

    version(version: string): Version;
    tag(tagName: string): string;
    publishedAt(version: string): Date;

    public readme: {
        file: string;
        content: string;
    };
    public readonly id: string;
    public readonly rev: string;
    public readonly name: string;
    public readonly description: string;
    public readonly author: Registry.Human;
    public readonly maintainers: Registry.Human[];
    public readonly tags: string[];
    public readonly lastVersion: string;
    public readonly versions: string[];
    public readonly keywords: string[];
    public readonly createdAt: Date;
    public readonly updatedAt: Date;
    public readonly homepage: string;
    public readonly license: string;
    public readonly bugsURL: string;
}

declare class Registry {
    constructor(url?: string);

    public url: string;

    package(name: string, version?: string): Promise<Package>;
    search(options: SearchOptions): Promise<Registry.SearchResult>;
    metaData(): Promise<Registry.Meta>;
}

declare namespace Registry {

    interface SearchOptions {
        text: string;
        size?: number;
        from?: number;
        quality?: number;
        popularity?: number;
        maintenance?: number;
    }

    interface Meta {
        db_name: string;
        doc_count: number;
        doc_del_count: number;
        update_seq: number;
        purge_seq: number;
        compact_running: boolean;
        disk_size: number;
        other: {
            data_size: number;
        };
        data_size: number;
        sizes: {
            file: number;
            active: number;
            external: number;
        };
        instance_start_time: string;
        disk_format_version: number;
        committed_update_seq: number;
        compacted_seq: number;
        uuid: string;
    }

    interface Human {
        name: string;
        email?: string;
        username?: string;
        url?: string;
    }

    interface Repository {
        type: string;
        url: string
    }

    interface Dependencies {
        [depName: string]: string;
    }

    interface Dist {
        integrity?: string;
        shasum: string;
        tarball: string;
        fileCount?: number;
        unpackedSize?: number;
        "npm-signature"?: string;
    }

    interface SearchPackage {
        package: {
            name: string;
            scope: string;
            version: string;
            description: string;
            date: string;
            links: {
                [name: string]: string;
            },
            author: Registry.Human;
            publisher: Registry.Human;
            maintainers: Registry.Human[];
        };
        score: {
            final: number;
            detail: {
                quality: number;
                popularity: number;
                maintenance: number;
            }
        };
        searchScore: number;
    }

    interface SearchResult {
        objects: SearchPackage[];
        total: number;
        time: string;
    }

}

export as namespace Registry;
export = Registry;
