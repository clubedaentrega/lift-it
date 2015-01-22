/*globals it*/
'use strict'

var liftIt = require('../'),
	should = require('should')

var api

it('should lift a folder', function () {
	api = liftIt('test/api').lift()
})

it('should list all actions', function () {
	api.actions.should.have.length(1)
})

it('should let actions be executed', function (done) {
	api.run('item/create', {
		name: 'Water',
		value: 17
	}, function (err, response) {
		should(err).be.null
		response.should.be.eql({
			id: 12
		})
		done()
	})
})