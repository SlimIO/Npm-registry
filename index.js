// Require Third-party Dependencies
const got = require("got");
const semver = require("semver");

// Require Internal Dependencies
const Package = require("./src/Package");

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
        const res = await got(this.url);

        return JSON.parse(res.body);
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
        let url = `${this.url}${name}/`;
        if (typeof version === "string") {
            if (!semver.valid(version)) {
                throw new Error(`Invalid semver version ${version}`);
            }
            url = url.concat(version);
        }

        const { body } = await got(url);
        const data = JSON.parse(body);

        return new Package(data);
    }
}

// NPM Registry URL
Registry.URL = "https://registry.npmjs.org/";

module.exports = Registry;
