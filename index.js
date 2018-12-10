// Require Third-party Dependencies
const got = require("got");
const is = require("@slimio/is");

// Require Internal Dependencies
const Package = require("./src/Package");
const Version = require("./src/Version");
const { clamp } = require("./src/utils");

/**
 * @class Registry
 * @classdesc NPM Registry API Object
 * @property {String} url
 *
 * @author GENTILHOMME Thomas <gentilhomme.thomas@gmail.com>
 */
class Registry {
    /**
     * @constructor
     * @param {String=} url registry url (default value is Registry.DEFAULT_URL)
     *
     * @throws {TypeError}
     */
    constructor(url = Registry.DEFAULT_URL) {
        if (typeof url !== "string") {
            throw new TypeError("url should be a string");
        }

        this.url = url;
    }

    /**
     * @version 0.1.0
     *
     * @async
     * @method metaData
     * @desc API endpoint to get metadata of the given registry URL. Returned value is a Plain Object with all meta data.
     * @memberof Registry#
     * @returns {Promise<Object>}
     *
     * @example
     * const Registry = require("@slimio/npm-registry");
     *
     * async function main() {
     *     const npmRegistry = new Registry();
     *     const meta = await npmRegistry.metaData();
     *     console.log(meta.db_name);
     *     console.log(meta.doc_count);
     * }
     * main().catch(console.error);
     */
    async metaData() {
        const { body } = await got(this.url, { json: true });

        return body;
    }

    /**
     * @version 0.1.0
     *
     * @async
     * @method package
     * @desc Search a given package by his name (and optionally his version). It will return a new Package instance.
     * @memberof Registry#
     * @param {!String} name package name
     * @returns {Promise<Package>}
     *
     * @throws {TypeError}
     * @throws {Error}
     *
     * @example
     * const Registry = require("@slimio/npm-registry");
     *
     * async function main() {
     *     const npmRegistry = new Registry();
     *     const ava = await npmRegistry.package("ava");
     *     console.log(ava.lastVersion);
     *     console.log(ava.versions);
     * }
     * main().catch(console.error);
     */
    async package(name) {
        if (typeof name !== "string") {
            throw new TypeError("name should be a string");
        }

        try {
            const { body } = await got(`${this.url}/${name}/`, { json: true });

            return new Package(body);
        }
        catch (error) {
            if (Registry.DEBUG) {
                console.error(error);
            }
            throw new Error(error.body.error);
        }
    }

    /**
     * @version 0.1.0
     *
     * @async
     * @method packageVersion
     * @desc Search a given package version.
     * @memberof Registry#
     * @param {!String} name package name
     * @param {!String} version package version
     * @returns {Promise<Version>}
     *
     * @throws {TypeError}
     * @throws {Error}
     */
    async packageVersion(name, version) {
        if (typeof name !== "string") {
            throw new TypeError("name should be a string");
        }
        if (typeof version !== "string") {
            throw new TypeError("version should be a string");
        }

        try {
            const { body } = await got(`${this.url}/${name}/${version}`, { json: true });

            return new Version(body);
        }
        catch (error) {
            if (Registry.DEBUG) {
                console.error(error);
            }
            throw new Error(error.body.error);
        }
    }

    /**
     * @version 0.1.0
     *
     * @async
     * @method userPackages
     * @desc Find all packages name and right of a given user.
     * @memberof Registry#
     * @param {!String} userName userName
     * @returns {Promise<any>}
     *
     * @throws {TypeError}
     *
     * @example
     * const Registry = require("@slimio/npm-registry");
     *
     * async function main() {
     *     const npmRegistry = new Registry();
     *     const packages = await npmRegistry.userPackages("fraxken");
     *     console.log(packages);
     * }
     * main().catch(console.error);
     */
    async userPackages(userName) {
        if (typeof userName !== "string") {
            throw new TypeError("userName should be a string");
        }

        try {
            const URL = `${this.url}/-/user/${userName}/package`;
            const { body } = await got(URL, { json: true });

            return body;
        }
        catch (error) {
            if (Registry.DEBUG) {
                console.error(error);
            }
            throw new Error(error.body.error);
        }
    }

    /**
     * @version 0.1.0
     *
     * @async
     * @method search
     * @desc Full-text search API
     * @memberof Registry#
     * @param {!Object} searchOption search options
     * @param {String=} searchOption.text full-text search to apply
     * @param {Number=} searchOption.size how many results should be returned (default 20, max 250)
     * @param {Number=} searchOption.from offset to return results from
     * @returns {Promise<void>}
     *
     * @throws {TypeError}
     *
     * @example
     * const Registry = require("@slimio/npm-registry");
     *
     * async function main() {
     *     const npmRegistry = new Registry();
     *     const result = await npmRegistry.search({
     *         text: "author:fraxken"
     *     });
     *     console.log(result);
     * }
     * main().catch(console.error);
     */
    async search(searchOption) {
        if (!is.plainObject(searchOption)) {
            throw new TypeError("searchOption should be a plainObject");
        }
        const query = new URL(`${this.url}/-/v1/search`);

        // Apply options to the URL
        const { text, size, from, quality, popularity, maintenance } = searchOption;
        if (is.string(text)) {
            query.searchParams.set("text", text);
        }
        if (is.number(size)) {
            query.searchParams.set("size", clamp(size, 0, 250));
        }
        if (is.number(from)) {
            query.searchParams.set("from", from);
        }
        if (is.number(quality)) {
            query.searchParams.set("quality", clamp(quality, 0, 1));
        }
        if (is.number(popularity)) {
            query.searchParams.set("popularity", clamp(popularity, 0, 1));
        }
        if (is.number(maintenance)) {
            query.searchParams.set("maintenance", clamp(maintenance, 0, 1));
        }

        // Send the Query
        const { body } = await got(query.href, { json: true });

        return body;
    }

    /**
     * @version 0.1.1
     *
     * @async
     * @method membership
     * @desc Get memberships of an organisation
     * @memberof Registry#
     * @param {String=} scope organisation
     * @param {String} auth authentication
     * @returns {Promise<Roster>}
     */
    async membership(scope, auth) {
        if (!is.string(scope)) {
            throw new TypeError("scope param must be typeof <string>");
        }
        if (is.nullOrUndefined(auth)) {
            const { body } = await got(`${this.url}/-/org/${scope}/user`, { json: true });

            return body;
        }
        if (!is.string(auth)) {
            throw new TypeError("auth param must be typeof <string>");
        }

        let res;
        try {
            res = await got(
                `${this.url}/-/org/${scope}/user`,
                { auth, json: true }
            );

            return res.body;
        }
        catch (err) {
            throw new Error(err);
        }
    }
}

// NPM Registry URL
Registry.DEFAULT_URL = "https://registry.npmjs.org";
Registry.DEBUG = false;

module.exports = Registry;
