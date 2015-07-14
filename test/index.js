/*globals describe, it*/
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
		should(err).be.null()
		response.should.be.eql({
			id: 12
		})
		done()
	})
})

describe('lean', function () {
	var lean

	it('should do a lean lift', function () {
		lean = liftIt.lean('test/api')
		lean.actions.should.have.length(1)
	})

	it('should not run actions', function () {
		var boom = function () {
			lean.run('item/create')
		}
		boom.should.throw('This Lifted instance is lean, no action can be executed')

		var boom2 = function () {
			lean.get('item/create').run()
		}
		boom2.should.throw('This Action instance is lean, and cannot be executed')
	})
})