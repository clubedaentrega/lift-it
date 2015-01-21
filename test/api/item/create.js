'use strict'

module.exports.handler = function (body, success) {
	body.should.be.eql({
		name: 'Water',
		value: 17
	})
	success({
		id: 12
	})
}