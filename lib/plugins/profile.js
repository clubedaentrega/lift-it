'use strict'

module.exports = function () {
	return function (action) {
		let profile = action.module.profile

		if (typeof profile === 'boolean') {
			action.profile = profile
		}
	}
}