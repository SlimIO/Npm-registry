/**
 * @namespace utils
 */

/**
 * @function Clamp
 * @memberof utils#
 * @desc Clamp a given number into min and max
 * @param {!Number} property property
 * @param {Number} min min
 * @param {Number} max max
 * @returns {Number}
 */
function clamp(property, min, max) {
    return Math.min(Math.max(property, min), max);
}

module.exports = {
    clamp
};
