'use strict'

var validateFields = require('validate-fields')

module.exports = function (options) {
	// Read options
	options = options || {}
	var validate = validateFields(),
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
		var fields = action.module[exportName],
			ErrorClass = lifter.errorClass

		if (!optional && !fields) {
			throw new Error('The file must export the validation schema')
		} else if (!fields) {
			// Ignore
			return
		}

		var schema = validate.parse(fields)
		action.module[exportName] = schema
		action[direction === 'input' ? 'filters' : 'postFilters'].push(function () {
			var len = arguments.length,
				args = [].slice.call(arguments, 0, len - 2),
				success = arguments[len - 2],
				value = args[position],
				err

			if (value === undefined) {
				value = getDefaultValue()
			}

			if (schema.validate(value, validateOptions)) {
				if (direction === 'input') {
					success()
				} else {
					success.apply(null, args)
				}
				return
			}

			err = new ErrorClass(schema.lastError)
			err.code = code
			errorHandler(action, value, err)
		})
	}
}

function defaultErrorHandler(action, value, err) {
	throw err
}

function defaultGetDefaultValue() {
	throw new Error('Insufficient number of arguments')
}