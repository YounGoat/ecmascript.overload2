#   overload2

Notable changes to this project will be documented in this file. This project adheres to [Semantic Versioning 2.0.0](http://semver.org/).

##	[0.2.0] - 2017-06, Mutable Param

###	What's New?

Since this section, programmers are allowed to use mutable param. E.g.
```javascript
overload2()
	.overload('+', Function, function(/*Array*/ data, callback) {
		// ...
	})
	.overload(Error, '*', function(err, /*Array*/ rest) {
		// ...
	})
```

For more details, see the testcase named [mutable.js](./test/mutable.js).

__ATTENTION:__
Before, `'*'` is alias of `overload2.Type.ANY`. And now, it is mapped to any number of arguments of any type.

###	Fixed

Next bugs have been fixed in this version:

*	Failed to run the default method when no predefined paramlist matched.

	In previous version, `TypeError: Cannot read property 'apply' of undefined` will be thrown when overload2 tries to execute the default method.


##	[0.1.0] - 2017-06

###	Functions Added

*	__overload2.Type.and()__  
*	__overload2.Type.or()__  
*	__overload2.Type.not()__  

###	Changed

Predefined datatypes are moved from `overload2.*` to `overload2.Type.*`.

##	[0.0.5] - 2017-05

No material changes, but TRAVIS-CI and COVERALLS integrated.

##	[0.0.4] - 2017-05

Usage in browsers supported since this version. Three ways to import the package(module):

*	as [CommonJS](http://www.commonjs.org)  
	e.g. in Node.js runtime

*	as AMD (Asynchronous Module Definition)  
	e.g. [RequireJS](http://www.requirejs.org)

*	directly exposed in global context  

###	REFERENCE

*	[Writing Modular JavaScript With AMD, CommonJS & ES Harmony](https://addyosmani.com/writing-modular-js/)

##	[0.0.3] - 2017-05

``overload2()`` will create a new overloaded function. Before, in v0.0.2, the overloaded function may be appended with an implementation meanwhile being created, if ``overload2()`` is called with arguments. This pattern is not only ambiguous, but also restrict the future expandability of *overload2* (arguments passed to ``overload2()`` SHOULD be used to define attributes concerned with overloading, instead of specific implementation). So, since this version, ``overload2()`` will return an overloaded function _WITHOUT ANY IMPLEMENTATION_. And programmers must implement it by calling ``.overload()`` method.

##	[0.0.1] - 2017-04

Released.

---
This CHANGELOG.md follows [*Keep a CHANGELOG*](http://keepachangelog.com/).
