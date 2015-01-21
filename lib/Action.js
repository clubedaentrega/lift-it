'use strict'

/**
 * @param {string} path
 * @param {string} name
 * @param {boolean} profile
 * @class
 */
function Action(path, name, profile) {
	var file = require(path),
		handler = file.handler
	
	if (typeof handler !== 'function') {
		throw new Error('Expected the file to export a handler function')
	}
	
	/** @member {string} */
	this.path = path
	
	/** @member {string} */
	this.name = name
	
	/** @member {Object} */
	this.module = file
	
	/** @member {Array<Function>} */
	this.filters = []
	
	/** @member {Function} */
	this.handler = handler
	
	/** @member {boolean} */
	this.profile = profile
	
	/** @member {Function} */
	this.run = null // set on Lifted._add
}

module.exports = Action