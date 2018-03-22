'use strict'

let Lifter = require('./lib/Lifter')

module.exports = function (folder) {
	return new Lifter(folder)
}

module.exports.lean = function (folder) {
	return new Lifter(folder).leanLift()
}

module.exports.filters = require('./lib/plugins/filters')
module.exports.profile = require('./lib/plugins/profile')
module.exports.validate = require('./lib/plugins/validate')