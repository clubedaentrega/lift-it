# Lift It
[![Build Status](https://travis-ci.org/clubedaentrega/lift-it.svg?branch=master)](https://travis-ci.org/clubedaentrega/lift-it)
[![Inline docs](http://inch-ci.org/github/clubedaentrega/lift-it.svg?branch=master)](http://inch-ci.org/github/clubedaentrega/lift-it)
[![Dependency Status](https://david-dm.org/clubedaentrega/lift-it.svg)](https://david-dm.org/clubedaentrega/lift-it)

Forget about maintaining routes files, use dynamic routes created from files in a folder

## Install
`npm install lift-it --save`

## Basic usage
```js
// Lift the 'api' folder
var api = require('lift-it')('./api').lift()

// Execute the file ./api/item/create.js
api.run('item/create', {
	name: 'Water',
	value: 17
}, function (err, response) {
	// Always async
})
```

Lift-it scans recursively a folder for `*.js` files. Those files should export a `handler` function, executed when someones 'run' them.

An example of 'item/create':
```js
// `body` is the argument passed by 'run' (in this case, `{name:'Water',value:17}`)
// `success` and `error` are callback functions, learn about it here:
// https://github.com/clubedaentrega/run-it
module.exports.handler = function (body, success, error) {
	// Item.create represents an async job
	Item.create(body, error(function (item) {
		// Answer with {id: '54bd55fc13e53ce1077415a2'}
		success({
			id: item.id
		})
	}))
}
```

## Express example
This module can be easily used with express (or any other route-based web framework).

An example of simple JSON-based POST api:
```js
// Express
var app = require('express')()
app.use(require('body-parser').json())

// Lift
var api = require('lift-it')('./api').lift()

// Set routes
api.actions.forEach(function (action) {
	// `action` is an object. See the docs bellow
	
	app.post(action.name, function (req, res) {
		
		// action.run(...) is the same as api.run(action.name, ...)
		action.run(req.body, function (err, response) {
			res.json(err ? {error: String(err)} : response)
		})
	})
})
```

## Plugins
The base module will scan a folder and look for exported handler in `*.js` files. This base behaviour can be expanded with plugins.

The available bundled plugins are:

* validate: validate the input with [validate-fields](https://www.npmjs.com/package/validate-fields)
* filters: add filters (like middlewares)
* profile: enable profiling async jobs

## Docs
### require('lift-it')
A function with one parameter, the folder path to scan: `require('lift-it')(folder)`.
Returns a `lifter` object.

### require('lift-it').lean()
Do a lean lift. See `lifter.lean()`. Returns a lifted instance

### lifter.use(plugIn)
Add the given plugin to the lift process. Read more about available and custom plugins bellow

### lifter.recursive
Whether the folder should be scanned recursively or not. The default value is `true`.

### lifter.profile
### lifter.errorClass
### lifter.enableErrorCode
Change settings of [run-it](https://www.npmjs.com/package/run-it). Must be changed only before `lifter.lift()` is called.

### lifter.lift()
Run the lift process (sync), throws if any error happens. For each `*.js` file in the target folder, all plugins will be executed in the order they were 'use'd.

This returns a `lifted` object.

### lifter.leanLift()
Run the lean lift process, that is, only look for file names. This will not require files, nor apply plugins.

This returns a `lifted` object with the `lean` flag on. No action can be executed on it.

This is useful if you just want to check action names, not execute them.

### lifted.get(name)
Return an action by name. Return an `action` object (or `null` if not found).

### lifted.run(name, ...args, callback)
Run the action with the given arguments. `callback(err,...output)` is executed when done. The action is executed in its own domain, see [run-it](https://www.npmjs.com/package/run-it) for more info about that.

Throws if no action with the given name is found.

If profile is enabled, the last argument for `callback` is the profile data.

### lifted.getRunner(name)
Return a run-it runner for the given action. Call `runner.exec(...args, callback)` to actually execute the action. See `action.getRunner()`.

Throws if no action with the given name is found.

### lifted.actions
An array of `action` objects

### lifted.lean
A boolean. If `true`, this is a lean lift (see `lifter.leanLift()`), so no action can be executed.

### action.path
File path, like `'/api/item/create.js'`

### action.name
Action name, like `'item/create'`. This is the relative path to the target folder, without the trailing `'.js'`.

### action.filters
An array of filters, executed before the action handler. This is used by plugins.

### action.postFilters
An array of post filters, executed after the action handler. This is used by plugins.

### action.module
The result of `require`-ing the file. `action.module.handler` is the handler for this action.

### action.profile
A boolean that flags whether profiling is enabled for this action.

### action.run(...args, callback)
Run this action. This is the same as `lifted.run(action.name, ...args, callback)`.

### action.getRunner()
Return the run-it runner for the action. Call `runner.exec(...args, callback)` to actually execute the action.

This is useful to make some adhoc changes to the runner, like `runner.runInfo(info).profile(true).exec(...args, callback)`. See docs on run-it.

## Available plugins

### Profile
If the `require`-d file exports `profile` (a boolean), this value will overwrite the global `lift.profile`. Get this plugin with `require('lift-it').profile()`.

For example, this file will have profiling always on:
```js
module.exports.profile = true
module.exports.handler = function (body, success, error) {
	// ...
}
```

Use:
```js
var liftIt = require('lift-it'),
	lift = liftIt('./api')
lift.use(liftIt.profile())
var api = lift.lift()
api.run('item/create', item, function (err, response, profileData) {
	// ...
})
```

### Validate
Add input validation with [validate-fields](https://www.npmjs.org/package/validate-fields). Get it with `require('lift-it').validate(options)`.

`options` is an optional object with the properties displayed bellow (default values indicated):
```js
options = {
	// The export property name
	exportName: 'fields',
	// Whether to error out if the file does not export it
	optional: false,
	// Check input or output
	direction: 'input',
	// Which argument to validate
	// The default will check the first
	position: 0,
	// A function to return a value if the desired input/output is not present
	getDefaultValue: function () {
		throw new Error('Insufficient number of arguments')
	},
	// If lifter.enableErrorCode is true, which code to use in error(code, msg)
	code: 101,
	// A function to handle error cases
	errorHandler: function (action, value, err) {
		// `action` is an Action instance
		// `value` is the offending value
		// `err` is a lifter.errorClass instance
		// `err.code` is `options.code`
		throw err
	},
	// Let you define your own custom types
	// See doc on validate-fields module for that
	defineTypes: function (validate) {},
	// Options passed to schema.validate() of validate-fields
	options: {}
}
```

Example of a file using it:
```js
module.exports.fields = {
	name: String,
	value: 'uint'
}
module.exports.handler = function (body, success, error) {
	// ...
}
```

```js
var liftIt = require('lift-it'),
	lift = liftIt('./api')
lift.use(liftIt.validate())
var api = lift.lift()
api.run('item/create', {}, function (err) {
	// err is new Error('I was expecting a value in name')
})
```

This plugin will set `action.module[exportName]` to `validate.parse(action.module[exportName])`.

### Filters
Add support for filters. Filters are functions executed sequentially before the handler. One example of their use is implementing authentication. Get it with `require('lift-it').filters(folder)`.

Filter handlers are implemented and exported by files in the filters folder. Each of those files may export as many filters as you want.

See an example of a file implementing two filters:
```js
module.exports = function (body, success, error) {
	// Check auth, read the DB, etc
	success('Some data I got elsewhere')
}
module.exports.double = function (body, success, error) {
	// Simply change the body input
	body.value *= 2
	success()
}
```

The `'item/create'` action may use those filters this way:
```js
module.exports.filters = ['myFilter', 'myFilter.double']
module.exports.handler = function (body, moreData, success, error) {
	// body.value will be doubled
	// moreData will be the string create by the first filter
	// ...
}
```

If this filter file path is `'filters/myFilter.js'`, the main file (the one that lifts everything) may be:
```js
var liftIt = require('lift-it'),
	lift = liftIt('./api')
lift.use(liftIt.filters('./filters'))
var api = lift.lift()
api.run('item/create', {value: 10}, function (err, response) {
	// ...
})
```

## Custom plugins
A plugin is a function like `function (action, lifter) {}`. That function is called once for every file that is found in the lifted folder. Creating your own plugin is that simple:

```js
var myPlugin = function (action, lifter) {
	// Do something with the action, like checking something
	if (action.name.indexOf('drop')) {
		throw new Error('Sorry, we do not put up with dropping things...')
	}
	
	// Add a filter to every action to delay them by 1s
	action.filters.push(function (body, success) {
		setTimeout(success, 1e3)
	})
	
	// Add a post filter to check something
	action.postFilters.push(function (response, success) {
		if (typeof response.status !== 'string') {
			throw new Error('Response should have the status field')
		}
		success(response)
	})
}
```

Warn: the `lifter` object should not be modified. It should be treated as read-only.