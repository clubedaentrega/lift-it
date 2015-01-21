'use strict'

var runIt = require('run-it'),
	Lifted = require('./Lifted'),
	fs = require('fs'),
	path = require('path'),
	Action = require('Action')

/**
 * @callback Plugin
 * @param {Action} action
 */

/**
 * @param {string} folder
 * @class
 */
function Lifter(folder) {
	/** @member {string} */
	this.folder = path.resolve(folder)

	/** @member {boolean} */
	this.profile = false

	/** @member {Function} */
	this.errorClass = Error

	/** @member {boolean} */
	this.enableErrorCode = false

	/** @member {Array<Plugin>} */
	this.plugins = []
}

module.exports = Lifter

/**
 * Add the given plugin
 * @param {Plugin} plugin
 */
Lifter.prototype.use = function (plugin) {
	this.plugins.push(plugin)
}

/**
 * Do the lift process
 * @returns {Lifted}
 */
Lifter.prototype.lift = function () {
	var run = runIt()

	// Set run-it options
	run.profile = this.profile
	run.errorClass = this.errorClass
	run.enableErrorCode = this.enableErrorCode

	// Create lifted obj
	var lifted = new Lifted(run)

	// Scan recursively
	this._scan(lifted, this.folder, '')
	
	return lifted
}

/**
 * Recursive scan
 * @param {Lifted} lifted
 * @param {string} folder
 * @param {string} name
 * @private
 */
Lifter.prototype._scan = function (lifted, folder, name) {
	fs.readdirSync(folder).forEach(function (each) {
		var subPath = path.join(folder, each),
			subName = name ? name + '/' + each : each,
			stat = fs.statSync(subPath)

		if (stat.isDirectory()) {
			this._scan(lifted, subPath, subName)
		} else if (each.substr(-3).toLowerCase() === '.js') {
			this._liftFile(lifted, subPath, subName)
		}
	})
}

/**
 * Require a file
 * @param {Lifted} lifted
 * @param {string} filePath
 * @param {string} name
 * @private
 */
Lifter.prototype._liftFile = function (lifted, filePath, name) {
	var action = new Action(filePath, name, this.profile)
	
	// Apply plugins
	this.plugins.forEach(function (plugin) {
		plugin(action)
	})
	
	lifted._add(action)
}