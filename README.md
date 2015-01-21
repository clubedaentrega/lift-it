# Lift It

Forget about maintaining routes files, use dynamic routes created from files in a folder

## Install
`npm install lift-it --save`

## Status
This is a **WORK IN PROGRESS**

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
Returns a `lift` builder.

### lift.use(plugIn)
Add the given plugin to the lift process. Read more about available and custom plugins bellow

### lift.profile
### lift.errorClass
### lift.enableErrorCode
Change settings of [run-it](https://www.npmjs.com/package/run-it). Must be changed only before `lift.lift()` is called.

### lift.lift()
Run the lift process (sync), throws if any error happens. For each `*.js` file in the target folder, all plugins will be executed in the order they were 'use'd.

This returns a `lifted` object.

### lifted.get(name)
Return an action by name. Return an `action` object (or `null` if not found).

### lifted.run(name, ...args, callback)
Run the action with the given arguments. `callback(err,...output)` is executed when done. The action is executed in its own domain, see [run-it](https://www.npmjs.com/package/run-it) for more info about that.

Throws if (and only if) no action if the given name is found.

If profile is enabled, the last argument for `callback` is the profile data.

### lifted.actions
An array of `action` objects

### action.path
File path, like `'/api/item/create.js'`

### action.name
Action name, like `'item/create'`. This is the relative path to the target folder, without the trailing `'.js'`.

### action.filters
An array of filters. This is used by plugins.

### action.module
The result of `require`-ing the file. `action.module.handler` is the handler for this action.

### action.profile
A boolean that flags whether profiling is enabled for this action.

### action.run(...args, callback)
Run this action. This is the same as `lifted.run(action.name, ...args, callback)`.

## Available plugins

### Profile
TODO

### Validate
TODO

### Filters
TODO

## Custom plugins
TODO