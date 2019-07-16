"use strict";

// Require Third-party Dependencies
const is = require("@slimio/is");
const { get } = require("httpie");

// Require Internal Dependencies
const Package = require("./src/Package");
const Version = require("./src/Version");
const { clamp } = require("./src/utils");

// CONSTANTS
const E_DOWNLOAD_TYPE = new Set(["last-day", "last-week", "last-month"]);

/**
 * @class Registry
 * @classdesc NPM Registry API Object
 * @property {string} url
 * @property {string} api_url
 *
 * @author GENTILHOMME Thomas <gentilhomme.thomas@gmail.com>
 */
class Registry {
    /**
     * @class
     * @param {string} [url] registry url (default value is Registry.DEFAULT_URL)
     *
     * @throws {TypeError}
     */
    constructor(url = Registry.DEFAULT_URL) {
        if (typeof url !== "string") {
            throw new TypeError("url must be a string");
        }

        this.url = url;
        this.api_url = Registry.DEFAULT_API;

        this.headers = Object.create(null);
    }

    /**
     * @version 0.4.0
     *
     * @function login
     * @description Initialize header Authorization
     * @memberof Registry#
     * @param {string} auth string token or authentication
     *
     * @returns {void}
     *
     * @throws {TypeError}
     *
     * @example
     * const Registry = require("@slimio/npm-registry");
     *
     * async function main() {
     *     const npmRegistry = new Registry();
     *     npmRegistry.login("username:password");
     *     // or
     *     npmRegistry.login("token");
     *     // use API
     * }
     * main().catch(console.error);
     */
    login(auth) {
        if (!is.string(auth)) {
            throw new TypeError("auth param must be a typeof string");
        }

        if (auth.split(":")[1] === undefined) {
            Reflect.set(this.headers, "Authorization", `Bearer ${auth}`);
        }
        else {
            Reflect.set(this.headers, "Authorization", `Basic ${Buffer.from(auth).toString("base64")}`);
        }
    }

    /**
     * @version 0.4.0
     *
     * @function logout
     * @description Remove header Authorization
     * @memberof Registry#
     *
     * @returns {void}
     *
     * @example
     * const Registry = require("@slimio/npm-registry");
     *
     * async function main() {
     *     const npmRegistry = new Registry();
     *     npmRegistry.login("username:password");
     *     // use API
     *     npmRegistry.logout();
     * }
     * main().catch(console.error);
     */
    logout() {
        Reflect.deleteProperty(this.headers, "Authorization");
    }

    /**
     * @version 0.1.0
     *
     * @async
     * @function metaData
     * @description API endpoint to get metadata of the given registry URL. Returned value is a Plain Object with all meta data.
     * @memberof Registry#
     * @returns {Promise<object>}
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
        return (await get(this.url)).data;
    }

    /**
     * @version 0.1.0
     *
     * @async
     * @function package
     * @description Search a given package by his name (and optionally his version). It will return a new Package instance.
     * @memberof Registry#
     * @param {!string} name package name
     * @param {string} [version] package version
     * @returns {Promise<Package | Version>}
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
    async package(name, version) {
        if (typeof name !== "string") {
            throw new TypeError("name must be a string");
        }
        const verDefined = is.string(version);

        try {
            const { data: body } = await get(`${this.url}/${name}/${verDefined ? version : ""}`, { headers: this.headers });

            return verDefined ? new Version(body) : new Package(body);
        }
        catch (error) {
            if (Registry.DEBUG) {
                console.error(error);
            }
            throw new Error(error.message);
        }
    }

    /**
     * @version 0.1.0
     *
     * @async
     * @function userPackages
     * @description Find all packages name and right of a given user.
     * @memberof Registry#
     * @param {!string} userName userName
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
            const { data: body } = await get(`${this.url}/-/user/${userName}/package`, { headers: this.headers });

            return body;
        }
        catch (error) {
            if (Registry.DEBUG) {
                console.error(error);
            }
            throw new Error(error.message);
        }
    }

    /**
     * @version 0.1.0
     *
     * @async
     * @function search
     * @description Full-text search API
     * @memberof Registry#
     * @param {!object} searchOption search options
     * @param {string} [searchOption.text] full-text search to apply
     * @param {number} [searchOption.size] how many results should be returned (default 20, max 250)
     * @param {number} [searchOption.from] offset to return results from
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
        return (await get(query.href, { headers: this.headers })).data;
    }

    /**
     * @version 0.2.0
     *
     * @async
     * @function membership
     * @description Get memberships of an organisation
     * @memberof Registry#
     * @param {string} [scope] organisation
     * @param {string} [auth] authentication
     * @returns {Promise<Roster>}
     *
     * @throws {TypeError}
     * @throws {Error}
     */
    async membership(scope, auth) {
        if (typeof scope !== "string") {
            throw new TypeError("scope param must be typeof <string>");
        }

        try {
            const headers = {};
            if (is.string(auth)) {
                headers.Authorization = `Basic ${auth.toString("base64")}`;
            }
            const { data: body } = await get(`${this.url}/-/org/${scope}/user`, { headers: this.headers });

            return body;
        }
        catch (error) {
            if (Registry.DEBUG) {
                console.error(error);
            }

            throw new Error(error.message);
        }
    }

    /**
     * @version 0.3.0
     *
     * @async
     * @function downloads
     * @description Get downloads count for a given period (and eventually a given package).
     * @memberof Registry#
     * @param {!string} packageName packageName
     * @param {object} [options] options
     * @returns {Promise<Roster>}
     *
     * @throws {TypeError}
     * @throws {Error}
     */
    async downloads(packageName, options = Object.create(null)) {
        if (!is.string(packageName)) {
            throw new TypeError("packageName must be a string!");
        }
        if (!is.plainObject(options)) {
            throw new TypeError("options must be a plain object!");
        }

        // Retrieve options
        const { period = "last-day", type = "point" } = options;
        if (!E_DOWNLOAD_TYPE.has(period)) {
            throw new Error(`Unknown period ${period}`);
        }
        if (type !== "point" && type !== "range") {
            throw new Error("options.type must be equal to <point> or <range>");
        }

        try {
            const { data: body } = await get(
                `${this.api_url}/downloads/${type}/${period}/${packageName}`, { headers: this.headers });

            return body;
        }
        catch (error) {
            if (Registry.DEBUG) {
                console.error(error);
            }
            throw new Error(error.message);
        }
    }
}

// NPM Registry URL
Registry.DEFAULT_URL = "https://registry.npmjs.org";
Registry.DEFAULT_API = "https://api.npmjs.org/";
Registry.DEBUG = false;

module.exports = Registry;
