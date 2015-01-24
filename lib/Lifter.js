'use strict'

var runIt = require('run-it'),
	Lifted = require('./Lifted'),
	fs = require('fs'),
	path = require('path'),
	Action = require('./Action')

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
 * @param {boolean} [failHard=false]
 * @returns {Lifted}
 */
Lifter.prototype.lift = function (failHard) {
	var run = runIt()

	// Set run-it options
	run.profile = this.profile
	run.errorClass = this.errorClass
	run.enableErrorCode = this.enableErrorCode

	// Create lifted obj
	var lifted = new Lifted()

	// Scan recursively
	this._scan(lifted, this.folder, '', Boolean(failHard), run)

	return lifted
}

/**
 * Recursive scan
 * @param {Lifted} lifted
 * @param {string} folder
 * @param {string} name
 * @param {boolean} failHard
 * @param {Function} run
 * @private
 */
Lifter.prototype._scan = function (lifted, folder, name, failHard, run) {
	var that = this
	fs.readdirSync(folder).forEach(function (each) {
		var subPath = path.join(folder, each),
			subName = name ? name + '/' + each : each,
			stat = fs.statSync(subPath),
			action

		if (stat.isDirectory()) {
			that._scan(lifted, subPath, subName, failHard, run)
		} else if (each.substr(-3).toLowerCase() === '.js') {
			subName = subName.substr(0, subName.length - 3)
			action = new Action(subPath, subName, run)
			action.profile = that.profile
			try {
				that._liftFile(lifted, action)
			} catch (e) {
				// Add context to the exception
				e.message += ' (in ' + subName + ')'

				if (failHard) {
					throw e
				}

				that._failFile(lifted, action, e)
			}
			lifted._add(action)
		}
	})
}

/**
 * Require a file
 * @param {Lifted} lifted
 * @param {Action} action
 * @private
 */
Lifter.prototype._liftFile = function (lifted, action) {
	var file = require(action.path)
	action.module = file

	if (typeof file.handler !== 'function') {
		throw new Error('Expected the file to export a handler function')
	}
	action.handler = file.handler

	// Apply plugins
	this.plugins.forEach(function (plugin) {
		plugin(action, this)
	}, this)
}

/**
 * Handle lifting errors
 * @param {Lifted} lifted
 * @param {Action} action
 * @param {Error} e
 * @private
 */
Lifter.prototype._failFile = function (lifted, action, e) {
	// Save the error and create stub handler
	action.error = e
	action.filters = []
	action.handler = function () {
		throw e
	}
}