/* globals describe, it*/
'use strict'

let liftIt = require('../'),
	should = require('should')

let api

it('should lift a folder', () => {
	api = liftIt('test/api').lift()
})

it('should list all actions', () => {
	api.actions.should.have.length(1)
})

it('should let actions be executed', done => {
	api.run('item/create', {
		name: 'Water',
		value: 17
	}, (err, response) => {
		should(err).be.null()
		response.should.be.eql({
			id: 12
		})
		done()
	})
})

it('should not recurse if told not to', () => {
	let lifter = liftIt('test/api')
	lifter.recursive = false
	lifter.lift().actions.should.have.length(0)
})

describe('lean', () => {
	let lean

	it('should do a lean lift', () => {
		lean = liftIt.lean('test/api')
		lean.actions.should.have.length(1)
	})

	it('should not run actions', () => {
		function boom() {
			lean.run('item/create')
		}
		boom.should.throw('This Lifted instance is lean, no action can be executed')

		function boom2() {
			lean.get('item/create').run()
		}
		boom2.should.throw('This Action instance is lean, and cannot be executed')
	})
})