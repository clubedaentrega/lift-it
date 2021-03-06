'use strict'

let runIt = require('run-it'),
	Lifted = require('./Lifted'),
	fs = require('fs'),
	path = require('path'),
	Action = require('./Action')

/**
 * @callback Plugin
 * @param {Action} action
 */

/**
 * @callback Lifter~RequireFile
 * @param {function(string):Object} require
 * @param {string} path
 * @returns {Object}
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

	/** @member {boolean} */
	this.recursive = true

	/** @member {Array<Plugin>} */
	this.plugins = []

	/** @member {Lifter~RequireFile} */
	this.requireFile = function (require, path) {
		return require(path)
	}
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
	let run = runIt()

	// Set run-it options
	run.profile = this.profile
	run.errorClass = this.errorClass
	run.enableErrorCode = this.enableErrorCode

	// Create lifted obj
	let lifted = new Lifted(false)

	// Scan recursively
	if (fs.existsSync(this.folder)) {
		this._scan(lifted, this.folder, '', run, false)
	}

	return lifted
}

/**
 * Do the lean lift process, that is, only look for file names
 * This will not require files, nor apply plugins
 * No action can be executed on the returned Lifted instance
 * @returns {Lifted}
 */
Lifter.prototype.leanLift = function () {
	let lifted = new Lifted(true)
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
	let that = this
	fs.readdirSync(folder).forEach(each => {
		let subPath = path.join(folder, each),
			subName = name ? name + '/' + each : each,
			stat = fs.statSync(subPath),
			action

		if (stat.isDirectory()) {
			if (that.recursive) {
				that._scan(lifted, subPath, subName, run, lean)
			}
			// errors.js is a specific file that contains all components errors
		} else if (each.substr().toLowerCase() !== 'errors.js' && each.substr(-3).toLowerCase() === '.js') {
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
	let file = this.requireFile(require, action.path)
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