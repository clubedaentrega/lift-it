'use strict'

let validateFields = require('validate-fields')

module.exports = function (options) {
	// Read options
	options = options || {}
	let validate = validateFields(),
		exportName = options.exportName || 'fields',
		direction = options.direction || 'input',
		optional = Boolean(options.optional),
		position = options.position || 0,
		code = options.code === undefined ? 101 : options.code,
		errorHandler = options.errorHandler || defaultErrorHandler,
		getDefaultValue = options.getDefaultValue || defaultGetDefaultValue,
		defineTypes = options.defineTypes,
		validateOptions = options.options || {}

	// Define custom types
	if (defineTypes) {
		defineTypes(validate)
	}

	return function (action, lifter) {
		let fields = action.module[exportName],
			ErrorClass = lifter.errorClass

		if (!optional && !fields) {
			throw new Error('The file must export the validation schema')
		} else if (!fields) {
			// Ignore
			return
		}

		let schema = validate.parse(fields)
		action.module[exportName + '-schema'] = schema
		action[direction === 'input' ? 'filters' : 'postFilters'].push((...allArgs) => {
			let len = allArgs.length,
				args = allArgs.slice(0, len - 2),
				success = allArgs[len - 2],
				value = args[position],
				err

			if (value === undefined) {
				value = args[position] = getDefaultValue()
			}

			if (!schema.validate(value, validateOptions)) {
				err = new ErrorClass(schema.lastError)
				err.code = code
				errorHandler(action, value, err)
			}

			if (direction === 'input') {
				return success()
			}

			success(...args)
		})
	}
}

function defaultErrorHandler(action, value, err) {
	throw err
}

function defaultGetDefaultValue() {
	throw new Error('Insufficient number of arguments')
}