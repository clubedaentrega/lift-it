# 6.0.0
## Breaking change
* Dropped support for Node.JS < 6
* Update `validate-fields@4.0.0`

# 5.0.0
* Changed: major update run-it@v3
* Changed: add support for object with extra properties in `error()` functions

## Breaking changes
* Removed support for formats in `error()` functions

# 4.1.0
* Added: Lifter#requireFile callback to allow the user to hook into the requiring logic

# 4.0.1
* Changed: updated `validate-fields@3.5.0`

# 4.0.0
* Changed: the validate plugin does not overwrite the exported value any more
* Added: the validate plugin exposes the parsed schema on '${exportName}-schema'

# 3.1.0
* Changed: ignore if folder is missing [#1](https://github.com/clubedaentrega/lift-it/issues/1)

# 3.0.1
* Changed: bump dependencies

# 3.0.0
* Added: option to disable recursive scan [#3](https://github.com/clubedaentrega/lift-it/issues/3)

## Breaking change
* `failHard` option removed. See [#4](https://github.com/clubedaentrega/lift-it/issues/4)

# 2.1.0
* Added: `lifted.getRunner()` and `action.getRunner()`

# 2.0.0
* Changed: validate-fields@3.0.0

# 1.3.3
* Fixed: call success() after errorHandler (if it does not throw)

# 1.3.2
* Changed: using validate-fields@^2.1.0

# 1.3.1
* Fixed: set default value back to output in validate plugin with direction: 'output'

# 1.3.0
* Added: option to validate output in validate plugin