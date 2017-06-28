var MODULE_REQUIRE
	/* built-in */
	, assert = require('assert')

	/* NPM */

	/* in-package */
	, overload2 = require('../overload2')
	;

describe('Param Decorators', function() {
	it('Decorator "null"', function() {
		var fn = overload2()
			.overload('boolean', function() { return 'boolean'; })
			.overload([ 'number', 'null' ], function(n) { return 'number'; })
			.default(function () { return 'default'; })
			;

		assert.equal('boolean', fn(true));
		assert.equal('number', fn(1));
		assert.equal('number', fn(null));
		assert.equal('default', fn());
	});

	it('Decorator "undefined"', function() {
		var fn = overload2()
			.overload('boolean', function() { return 'boolean'; })
			.overload([ 'number', 'undefined' ], function(n) { return 'number'; })
			.default(function () { return 'default'; })
			;

		assert.equal('boolean', fn(true));
		assert.equal('number', fn(1));
		assert.equal('number', fn(undefined));
		assert.equal('default', fn());
	});

	it('Mutable decorator', function() {
		var fn = overload2()
			.overload('boolean NULL {1,2}', function() {
				return 1;
			})
			.overload([Date, '1'], function() {
				return 2;
			})
			;

		assert.equal(1, fn(true, true));
		assert.equal(2, fn(new Date()));
	});
});
