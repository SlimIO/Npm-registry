"use strict";

// CONSTANTS
const META = Symbol("meta-data");

class Version {
    /**
     * @class Version
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
     * @property {string[]} keywords
     * @description Keywords of the current version
     * @returns {string[]}
     */
    get keywords() {
        return this[META].keywords || [];
    }

    /**
     * @property {object} author
     * @description Keywords of the current version
     * @returns {object}
     */
    get author() {
        return this[META].author || {};
    }

    /**
     * @property {string} description
     * @description Description of the current version
     * @returns {string}
     */
    get description() {
        return this[META].description;
    }

    /**
     * @property {*} dist
     * @description Version dist
     * @returns {*}
     */
    get dist() {
        return this[META].dist;
    }

    /**
     * @property {*} dependencies
     * @description Dependencies of the current version
     * @returns {*}
     */
    get dependencies() {
        return this[META].dependencies || {};
    }

    /**
     * @property {*} devDependencies
     * @description Dependencies of the current version
     * @returns {*}
     */
    get devDependencies() {
        return this[META].devDependencies || {};
    }

    /**
     * @property {*} peerDependencies
     * @description peerDependencies of the current version
     * @returns {*}
     */
    get peerDependencies() {
        return this[META].peerDependencies || {};
    }

    /**
     * @property {string} npmVersion
     * @description version of npm when published
     * @returns {string}
     */
    get npmVersion() {
        return this[META]._npmVersion;
    }

    /**
     * @property {string} nodeVersion
     * @description version of Node.js when published
     * @returns {string}
     */
    get nodeVersion() {
        return this[META]._nodeVersion;
    }

    /**
     * @property {*} npmUser
     * @description User npm who has published the current version
     * @returns {*}
     */
    get npmUser() {
        return this[META]._npmUser;
    }

    /**
     * @property {any[]} maintainers
     * @description Maintainers of the current version
     * @returns {any[]}
     */
    get maintainers() {
        return this[META].maintainers || [];
    }

    /**
     * @property {any[]} contributors
     * @description Contributors of the current version
     * @returns {any[]}
     */
    get contributors() {
        return this[META].contributors || [];
    }
}

module.exports = Version;
