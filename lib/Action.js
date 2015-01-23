'use strict'

/**
 * @param {string} path
 * @param {string} name
 * @class
 */
function Action(path, name) {
	/** @member {string} */
	this.path = path
	
	/** @member {string} */
	this.name = name
	
	/** @member {Object} */
	this.module = null
	
	/** @member {Array<Function>} */
	this.filters = []
	
	/** @member {Function} */
	this.handler = null
	
	/** @member {boolean} */
	this.profile = false
	
	/** @member {?Error} */
	this.error = null
	
	/** @member {Function} */
	this.run = null
}

module.exports = Action