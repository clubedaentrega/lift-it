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

	/** @member {Function} */
	this.handler = null

	/** @member {boolean} */
	this.profile = false

	/** @member {?Error} */
	this.error = null

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
Action.prototype.run = function () {
	if (!this._run) {
		throw new Error('This Action instance is lean, and cannot be executed')
	}

	if (!this._fnCache) {
		this._fnCache = this.filters.concat(this.handler)
	}
	var binded = this._run(this._fnCache).profile(this.profile)
	binded.exec.apply(binded, arguments)
}

module.exports = Action