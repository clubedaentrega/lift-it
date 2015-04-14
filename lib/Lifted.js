'use strict'

/**
 * @param {boolean} lean
 * @class
 */
function Lifted(lean) {
	/** @member {boolean} */
	this.lean = lean

	/** @member {Array<Action>} */
	this.actions = []

	/**
	 * @member {Object<Action>}
	 * @private
	 */
	this._map = Object.create(null)
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
	if (this.lean) {
		throw new Error('This Lifted instance is lean, no action can be executed')
	}
	var action = this._map[name]
	if (!action) {
		throw new Error('No action with name "' + name + '" found')
	}
	action.run.apply(action, [].slice.call(arguments, 1))
}

/**
 * @param {Action} action
 * @private
 */
Lifted.prototype._add = function (action) {
	this.actions.push(action)
	this._map[action.name] = action
}