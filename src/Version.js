// CONSTANTS
const META = Symbol("meta-data");

/**
 * @class Version
 */
class Version {
    /**
     * @constructor
     * @param {*} opt version payload
     */
    constructor(opt) {
        Reflect.defineProperty(this, META, {
            enumerable: false,
            writable: false,
            configurable: false,
            value: opt
        });

        this.name = opt.name;
        this.version = opt.version;
    }

    /**
     * @property {String[]} keywords
     * @desc Keywords of the current version
     */
    get keywords() {
        return this[META].keywords || [];
    }

    /**
     * @property {Object} author
     * @desc Keywords of the current version
     */
    get author() {
        return this[META].author || {};
    }

    /**
     * @property {String} description
     * @desc Description of the current version
     */
    get description() {
        return this[META].description;
    }

    /**
     * @property {*} dist
     * @desc Version dist
     */
    get dist() {
        return this[META].dist;
    }

    /**
     * @property {*} dependencies
     * @desc Dependencies of the current version
     */
    get dependencies() {
        return this[META].dependencies || {};
    }

    /**
     * @property {*} devDependencies
     * @desc Dependencies of the current version
     */
    get devDependencies() {
        return this[META].devDependencies || {};
    }

    /**
     * @property {*} peerDependencies
     * @desc peerDependencies of the current version
     */
    get peerDependencies() {
        return this[META].peerDependencies || {};
    }

    /**
     * @property {String} npmVersion
     * @desc version of npm when published
     */
    get npmVersion() {
        return this[META]._npmVersion;
    }

    /**
     * @property {String} nodeVersion
     * @desc version of Node.js when published
     */
    get nodeVersion() {
        return this[META]._nodeVersion;
    }

    /**
     * @property {*} npmUser
     * @desc User npm who has published the current version
     */
    get npmUser() {
        return this[META]._npmUser;
    }

    /**
     * @property {any[]} maintainers
     * @desc Maintainers of the current version
     */
    get maintainers() {
        return this[META].maintainers || [];
    }

    /**
     * @property {any[]} contributors
     * @desc Contributors of the current version
     */
    get contributors() {
        return this[META].contributors || [];
    }
}

module.exports = Version;
