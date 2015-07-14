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
 * @returns {Lifted}
 */
Lifter.prototype.lift = function () {
	var run = runIt()

	// Set run-it options
	run.profile = this.profile
	run.errorClass = this.errorClass
	run.enableErrorCode = this.enableErrorCode

	// Create lifted obj
	var lifted = new Lifted(false)

	// Scan recursively
	this._scan(lifted, this.folder, '', run, false)

	return lifted
}

/**
 * Do the lean lift process, that is, only look for file names
 * This will not require files, nor apply plugins
 * No action can be executed on the returned Lifted instance
 * @returns {Lifted}
 */
Lifter.prototype.leanLift = function () {
	var lifted = new Lifted(true)
	this._scan(lifted, this.folder, '', null, true)
	return lifted
}

/**
 * Recursive scan
 * @param {Lifted} lifted
 * @param {string} folder
 * @param {string} name
 * @param {Function} run
 * @param {Boolean} lean
 * @private
 */
Lifter.prototype._scan = function (lifted, folder, name, run, lean) {
	var that = this
	fs.readdirSync(folder).forEach(function (each) {
		var subPath = path.join(folder, each),
			subName = name ? name + '/' + each : each,
			stat = fs.statSync(subPath),
			action

		if (stat.isDirectory()) {
			that._scan(lifted, subPath, subName, run, lean)
		} else if (each.substr(-3).toLowerCase() === '.js') {
			subName = subName.substr(0, subName.length - 3)
			action = new Action(subPath, subName, run)
			action.profile = that.profile
			try {
				if (!lean) {
					that._liftFile(lifted, action)
				}
			} catch (e) {
				// Add context to the exception
				e.message += ' (in ' + subName + ')'
				throw e
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