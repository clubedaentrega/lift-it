'use strict'

module.exports = function () {
	return function (action) {
		var profile = action.module.profile
		
		if (typeof profile === 'boolean') {
			action.profile = profile
		}
	}
}