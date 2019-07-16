"use strict";

// Require Internal Dependencies
const Version = require("./Version");

// CONSTANTS
const META = Symbol("meta-data");

class Package {
    /**
     * @class Package
     * @author GENTILHOMME Thomas <gentilhomme.thomas@gmail.com>
     * @param {*} opt JSON Payload from npm registry
     */
    constructor(opt) {
        Reflect.defineProperty(this, META, {
            enumerable: false,
            writable: false,
            configurable: false,
            value: opt
        });

        this.readme = {
            file: opt.readmeFilename || "",
            content: opt.readme || ""
        };
    }

    /**
     * @version 0.1.0
     *
     * @function version
     * @description Get a given package version
     * @memberof Package#
     * @param {!string} version semver version
     * @returns {Version}
     *
     * @throws {Error}
     */
    version(version) {
        if (!Reflect.has(this[META].versions, version)) {
            throw new Error(`Unknown version ${version}`);
        }

        return new Version(this[META].versions[version]);
    }

    /**
     * @version 0.1.0
     *
     * @function publishedAt
     * @description Known the publication date of a given version!
     * @memberof Package#
     * @param {!string} version semver version
     * @returns {string}
     */
    publishedAt(version) {
        return new Date(this[META].time[version]);
    }

    /**
     * @version 0.1.0
     *
     * @function tag
     * @description Get the linked version of a given tag
     * @memberof Package#
     * @param {!string} tagName tag name
     * @returns {string}
     *
     * @throws {Error}
     */
    tag(tagName) {
        if (!Reflect.has(this[META]["dist-tags"], tagName)) {
            throw new Error(`Unknown tag with name ${tagName}`);
        }

        return this[META]["dist-tags"][tagName];
    }

    /**
     * @property {string} id
     * @description the package name, used as an ID in CouchDB
     * @returns {string}
     */
    get id() {
        return this[META]._id;
    }

    /**
     * @property {string} rev
     * @description the revision number of this version of the document in CouchDB
     * @returns {string}
     */
    get rev() {
        return this[META]._rev;
    }

    /**
     * @property {string[]} versions
     * @description Get all available versions
     * @returns {string}
     */
    get versions() {
        return Object.keys(this[META].versions);
    }

    /**
     * @property {string} name
     * @description Package name
     * @returns {string}
     */
    get name() {
        return this[META].name;
    }

    /**
     * @property {string} description
     * @description Package description
     * @returns {string}
     */
    get description() {
        return this[META].description;
    }

    /**
     * @property {string} createdAt
     * @description Creation date of the package
     * @returns {string}
     */
    get createdAt() {
        return new Date(this[META].time.created);
    }

    /**
     * @property {string} updatedAt
     * @description (last) Update date of the package
     * @returns {string}
     */
    get updatedAt() {
        return new Date(this[META].time.modified);
    }

    /**
     * @property {string} maintainers
     * @description Get the package maintainers
     * @returns {string}
     */
    get maintainers() {
        return this[META].maintainers;
    }

    /**
     * @property {string} author
     * @description Get the package author
     * @returns {string}
     */
    get author() {
        return this[META].author;
    }

    /**
     * @property {string} lastVersion
     * @description Last published version of the package
     * @returns {string}
     */
    get lastVersion() {
        return this[META]["dist-tags"].latest;
    }

    /**
     * @property {string[]} tags
     * @description Package available tags
     * @returns {string[]}
     */
    get tags() {
        return Object.keys(this[META]["dist-tags"]);
    }

    /**
     * @property {string[]} keywords
     * @description Package keywords
     * @returns {string[]}
     */
    get keywords() {
        return this[META].keywords || [];
    }

    /**
     * @property {string} homepage
     * @description Package homepage
     * @returns {string}
     */
    get homepage() {
        return this[META].homepage || "";
    }

    /**
     * @property {string} license
     * @description Package license
     * @returns {string}
     */
    get license() {
        return this[META].license || "";
    }

    /**
     * @property {string} bugsURL
     * @description Return package bugs url
     * @returns {string}
     */
    get bugsURL() {
        const url = this[META].bugs ? this[META].bugs.url : "";

        return url || "";
    }
}

module.exports = Package;
