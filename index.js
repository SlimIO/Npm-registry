// Require Third-party Dependencies
const got = require("got");
const semver = require("semver");
const is = require("@slimio/is")

// Require Internal Dependencies
const Package = require("./src/Package");

function clamp(property, min, max) {
    return Math.min(Math.max(property, min), max);
}

/**
 * @class registry
 * @property {String} url
 */
class Registry {
    /**
     * @constructor
     * @param {String=} url registry url
     *
     * @throws {TypeError}
     */
    constructor(url = Registry.URL) {
        if (typeof url !== "string") {
            throw new TypeError("url should be a string");
        }

        this.url = url;
    }

    /**
     * @async
     * @method metaData
     * @returns {Promise<Object>}
     */
    async metaData() {
        const { body } = await got(this.url, { json: true });

        return body;
    }

    /**
     * @async
     * @method package
     * @param {!String} name package name
     * @param {String=} version package version (semver)
     * @returns {Promise<Package>}
     *
     * @throws {TypeError}
     * @throws {Error}
     */
    async package(name, version) {
        if (typeof name !== "string") {
            throw new TypeError("name should be a string");
        }

        let url = `${this.url}/${name}/`;
        if (typeof version === "string") {
            if (!semver.valid(version)) {
                throw new Error(`Invalid semver version ${version}`);
            }
            url = url.concat(version);
        }

        // Request API
        const { body } = await got(url, { json: true });

        return new Package(body);
    }

    /**
     * @async
     * @method search
     * @param {Object} searchOption search options
     * @param {String} searchOption.text full-text search to apply
     * @param {Number} searchOption.size how many results should be returned (default 20, max 250)
     * @param {Number} searchOption.from offset to return results from
     * @returns {Promise<void>}
     */
    async search(searchOption) {
        if (!is.plainObject(searchOption)) {
            throw new TypeError("searchOption should be a plainObject");
        }
        const query = new URL(`${this.url}/-/v1/search`);

        if (is.string(searchOption.text)) {
            query.searchParams.set("text", searchOption.text);
        }
        if (is.number(searchOption.size)) {
            query.searchParams.set("size", clamp(searchOption.size, 0, 250));
        }
        if (is.number(searchOption.from)) {
            query.searchParams.set("from", searchOption.from);
        }
        if (is.number(searchOption.quality)) {
            query.searchParams.set("quality", clamp(searchOption.quality, 0, 1));
        }
        if (is.number(searchOption.popularity)) {
            query.searchParams.set("popularity", clamp(searchOption.popularity, 0, 1));
        }
        if (is.number(searchOption.maintenance)) {
            query.searchParams.set("maintenance", clamp(searchOption.maintenance, 0, 1));
        }

        const { body } = await got(query.toString(), { json: true });

        return body;
    }
}

// NPM Registry URL
Registry.URL = "https://registry.npmjs.org";

module.exports = Registry;
