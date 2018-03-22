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
 * @returns {run-it:Runner}
 * @throws if `name´ is not found
 */
Lifted.prototype.getRunner = function (name) {
	if (this.lean) {
		throw new Error('This Lifted instance is lean, no action can be executed')
	}
	let action = this._map[name]
	if (!action) {
		throw new Error('No action with name "' + name + '" found')
	}
	return action.getRunner()
}

/**
 * @param {string} name
 * @param {...*} args
 * @param {Function} callback
 * @throws if `name´ is not found
 */
Lifted.prototype.run = function (name, ...args) {
	let runner = this.getRunner(name)
	runner.exec(...args)
}

/**
 * @param {Action} action
 * @private
 */
Lifted.prototype._add = function (action) {
	this.actions.push(action)
	this._map[action.name] = action
}