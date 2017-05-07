var MODULE_REQUIRE
	/* built-in */
	, assert = require('assert')

	/* NPM */

	/* in-package */
	, overload2 = require('../overload2')
	;

var fn = overload2()
	.overload(
		Array,
		function(a) {
			return 'Array';
		}
	)
	.overload(
		Boolean,
		function(b) {
			return 'Boolean';
		}
	)
	.overload(
		Date,
		function(d) {
			return 'Date';
		}
	)
	.overload(
		Function,
		function(f) {
			return 'Function';
		}
	)
	.overload(
		RegExp,
		function(regexp) {
			return 'RegExp';
		}
	)
	.overload(
		String,
		function(s) {
			return 'String';
		}
	)
	.overload(
		'boolean',
		function(b) {
			return 'boolean';
		}
	)
	.overload(
		'number',
		function(n) {
			return 'number';
		}
	)
	.overload(
		'string',
		function(s) {
			return 'string';
		}
	)
	.overload(
		3,
		function(a, b, c) {
			return '3';
		}
	)
	.overload(
		0,
		function() {
			return '0';
		}
	)
	;

var fn2 = overload2()
	.default(
		function() {
			return 'default';
		}
	)

describe('Parameter Type, Constructor Functions', function() {

	it('Array', () => {
		assert.equal(fn([]), 'Array');
	});

	it('Boolean', () => {
		assert.equal(fn(new Boolean), 'Boolean');
	});

	it('Date', () => {
		assert.equal(fn(new Date), 'Date');
	});

	it('Function', () => {
		assert.equal(fn(function() {}), 'Function');
	});

	it('RegExp', () => {
		assert.equal(fn(/regexp/), 'RegExp');
	});

	it('String', () => {
		assert.equal(fn(new String('S')), 'String');
	});

});

describe('Parameter Type, Predefined Datatypes', function() {

	it('boolean', () => {
		assert.equal(fn(true), 'boolean');
	});

	it('number', () => {
		assert.equal(fn(1), 'number');
	});

	it('string', () => {
		assert.equal(fn('s'), 'string');
	});
});


describe('Parameters Length', function() {

	it('3 arguments', () => {
		assert.equal(fn(0,1,2), '3');
	});

	it('0 arguments', () => {
		assert.equal(fn(), '0');
	});
});
