// Require Internal Dependencies
const Version = require("./Version");

// CONSTANTS
const META = Symbol("MetaData");

/**
 * @class Package
 *
 * @author GENTILHOMME Thomas <gentilhomme.thomas@gmail.com>
 */
class Package {
    /**
     * @constructor
     * @param {*} opt JSON Payload from npm registry
     */
    constructor(opt) {
        this[META] = opt;
        this.readme = {
            file: opt.readmeFilename || "",
            content: opt.readme || ""
        };
    }

    /**
     * @version 0.1.0
     *
     * @method version
     * @desc Get a given package version
     * @memberof Package#
     * @param {!String} version semver version
     * @returns {Version}
     *
     * @throws {Error}
     */
    version(version) {
        if (!Reflect.has(this[META].versions, version)) {
            throw new Error(`Unknown version ${version}`);
        }

        return new Version(this, this[META].versions[version]);
    }

    /**
     * @version 0.1.0
     *
     * @method publishedAt
     * @desc Known the publication date of a given version!
     * @memberof Package#
     * @param {!String} version semver version
     * @returns {String}
     */
    publishedAt(version) {
        return new Date(this[META].time[version]);
    }

    /**
     * @version 0.1.0
     *
     * @method tag
     * @desc Get the linked version of a given tag
     * @memberof Package#
     * @param {!String} tagName tag name
     * @returns {String}
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
     * @property {String} id
     * @desc the package name, used as an ID in CouchDB
     */
    get id() {
        return this[META]._id;
    }

    /**
     * @property {String} rev
     * @desc the revision number of this version of the document in CouchDB
     */
    get rev() {
        return this[META]._rev;
    }

    /**
     * @property {String[]} versions
     * @desc Get all available versions
     */
    get versions() {
        return Object.keys(this[META].versions);
    }

    /**
     * @property {String} name
     * @desc Package name
     */
    get name() {
        return this[META].name;
    }

    /**
     * @property {String} description
     * @desc Package description
     */
    get description() {
        return this[META].description;
    }

    /**
     * @property {String} createdAt
     * @desc Creation date of the package
     */
    get createdAt() {
        return new Date(this[META].time.created);
    }

    /**
     * @property {String} updatedAt
     * @desc (last) Update date of the package
     */
    get updatedAt() {
        return new Date(this[META].time.modified);
    }

    /**
     * @property {String} maintainers
     * @desc Get the package maintainers
     */
    get maintainers() {
        return this[META].maintainers;
    }

    /**
     * @property {String} author
     * @desc Get the package author
     */
    get author() {
        return this[META].author;
    }

    /**
     * @property {String} lastVersion
     * @desc Last published version of the package
     */
    get lastVersion() {
        return this[META]["dist-tags"].latest;
    }

    /**
     * @property {String[]} tags
     * @desc Package available tags
     */
    get tags() {
        return Object.keys(this[META]["dist-tags"]);
    }

    /**
     * @property {String[]} keywords
     * @desc Package keywords
     */
    get keywords() {
        return this[META].keywords || [];
    }

    /**
     * @property {String} homepage
     * @desc Package homepage
     */
    get homepage() {
        return this[META].homepage || "";
    }

    /**
     * @property {String} license
     * @desc Package license
     */
    get license() {
        return this[META].license || "";
    }

    /**
     * @property {String} bugsURL
     * @desc Return package bugs url
     */
    get bugsURL() {
        const url = this[META].bugs ? this[META].bugs.url : "";

        return url || "";
    }
}

module.exports = Package;
