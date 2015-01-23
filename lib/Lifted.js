'use strict'

/**
 * @param {Function} run
 * @class
 */
function Lifted(run) {
	/** @member {Array<Action>} */
	this.actions = []

	/**
	 * @member {Object<Action>}
	 * @private
	 */
	this._map = Object.create(null)

	/**
	 * @member {Function}
	 * @private
	 */
	this._run = run
}

module.exports = Lifted

/**
 * @param {string} name
 * @returns {?Action}
 */
Lifted.prototype.get = function (name) {
	return this._map[name] || null
}

/**
 * @param {string} name
 * @param {...*} args
 * @param {Function} callback
 * @throws if `name´ is not found
 */
Lifted.prototype.run = function (name) {
	this._map[name].run.apply(null, [].slice.call(arguments, 1))
}

/**
 * @param {Action} action
 * @private
 */
Lifted.prototype._add = function (action) {
	this.actions.push(action)
	this._map[action.name] = action
}