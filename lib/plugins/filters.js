'use strict'

let path = require('path')

module.exports = function (folder) {
	// Make absolute
	folder = path.resolve(folder)

	return function (action) {
		let filters = action.module.filters || []

		// Add each filter to the action
		filters.forEach(name => {
			if (typeof name !== 'string') {
				throw new Error('Invalid filter name. Expected a string, got ' + typeof name)
			}

			let pos = name.indexOf('.'),
				filter
			if (pos === -1) {
				// simple filter, like 'auth'
				filter = require(path.join(folder, name))
			} else {
				// sub filter, like 'auth.admin'
				filter = require(path.join(folder, name.substr(0, pos)))[name.substr(pos + 1)]
			}
			if (typeof filter !== 'function') {
				throw new Error('Invalid filter ' + name +
					'. Expected a function, got ' + typeof filter)
			}

			action.filters.push(filter)
		})
	}
}