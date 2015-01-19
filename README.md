# Lift It

Forget about maintaining routes files, lift-it dynamic create routes from your folder structure.

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
	// Item.create represents a async job
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

TODO: spec