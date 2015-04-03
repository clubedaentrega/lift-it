'use strict'

var validateFields = require('validate-fields')

module.exports = function (options) {
	// Read options
	options = options || {}
	var validate = validateFields(),
		exportName = options.exportName || 'fields',
		optional = Boolean(options.optional),
		position = options.position || 0,
		code = options.code === undefined ? 101 : options.code,
		defineTypes = options.defineTypes,
		validateOptions = options.options || {}

	// Define custom types
	if (defineTypes) {
		defineTypes(validate)
	}

	return function (action, lifter) {
		var fields = action.module[exportName],
			hasCode = lifter.enableErrorCode

		if (!optional && !fields) {
			throw new Error('The file must export the validation schema')
		} else if (!fields) {
			// Ignore
			return
		}

		var schema = validate.parse(fields)
		action.module[exportName] = schema
		action.filters.push(function () {
			var len = arguments.length,
				success = arguments[len - 2],
				error = arguments[len - 1]

			if (len <= position + 2) {
				throw new Error('Insufficient number of arguments' +
					', expected a least ' + (1 + position))
			}

			if (schema.validate(arguments[position], validateOptions)) {
				success()
			} else if (hasCode) {
				error(code, schema.lastError)
			} else {
				error(schema.lastError)
			}
		})
	}
}