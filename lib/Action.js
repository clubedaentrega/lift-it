'use strict'

/**
 * @param {string} path
 * @param {string} name
 * @param {?Function} run - null if lean
 * @class
 */
function Action(path, name, run) {
	/** @member {string} */
	this.path = path

	/** @member {string} */
	this.name = name

	/** @member {Object} */
	this.module = {}

	/** @member {Array<Function>} */
	this.filters = []

	/** @member {Array<Function>} */
	this.postFilters = []

	/** @member {Function} */
	this.handler = null

	/** @member {boolean} */
	this.profile = false

	/**
	 * @member {Array<Function>}
	 * @private
	 */
	this._fnCache = null

	/**
	 * @member {Function}
	 * @private
	 */
	this._run = run
}

/**
 * @param {...*} args
 * @param {Function} done
 */
Action.prototype.run = function (...args) {
	let runner = this.getRunner()
	runner.exec(...args)
}

/**
 * @returns {run-it:Runner}
 */
Action.prototype.getRunner = function () {
	if (!this._run) {
		throw new Error('This Action instance is lean, and cannot be executed')
	}

	if (!this._fnCache) {
		this._fnCache = [this.filters, this.handler, this.postFilters]
	}
	return this._run(this._fnCache).profile(this.profile)
}

module.exports = Action