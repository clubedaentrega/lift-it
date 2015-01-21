'use strict'

var Lifter = require('./lib/Lifter')

module.exports = function (folder) {
	return new Lifter(folder)
}