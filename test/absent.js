var MODULE_REQUIRE
	/* built-in */
	, assert = require('assert')
	, DE = assert.deepEqual

	/* NPM */

	/* in-package */
	, overload2 = require('../overload2')
	;

var bool = true;
var number = 9;
var string = 'foo';
var date = new Date();
var obj = {};

function Foo() {};
var foo = new Foo();

describe('Param absent', function() {
	var fn = overload2()
		.overload('number', 'string ABSENT', function(number, string) {
			return [ 1, Array.from(arguments) ];
		})
		.overload('number', function(string) {
			return [ 2, Array.from(arguments) ];
		})
		.overload('string', 'number =1', function(string, number) {
			return [ 3, Array.from(arguments) ];
		})
		.overload('boolean', [ Date, overload2.absent(date) ], function(bool, date) {
			return [ 4, Array.from(arguments) ];
		})
		.overload(Date, 'boolean =true', 'number', function(date, bool, number) {
			return [ 5, Array.from(arguments) ];
		})
		.overload('object', 'number + ABSENT', [ Date, overload2.absent(date) ], 'boolean', function(obj, numbers, date, bool) {
			return [ 6, Array.from(arguments) ];
		})
		
		.overload(Foo, '? =null', 'number', function(foo, strings, number) {
			return [ 7, Array.from(arguments) ];
		})
		;

	it('last argument absent', function() {
		DE([ 1, [ number, string ] ], fn(number, string));
		DE([ 1, [ number, undefined ] ], fn(number));
	});

	it('last argument absent (with default value)', function() {
		DE([ 3, [ string, number ] ], fn(string, number));
		DE([ 3, [ string, 1 ] ], fn(string));
	});
	
	it('last argument absent (with complex default value)', function() {
		DE([ 4, [ bool, date ] ], fn(bool, date));
		DE([ 4, [ bool, date ] ], fn(bool));
	});

	it('non-last argument absent', function() {
		DE([ 5, [ date, bool, number ] ], fn(date, bool, number));
		DE([ 5, [ date, bool, number ] ], fn(date, number));
	});

	it('mutable argument absent', function() {
		DE([ 6, [ obj, [number], date, bool ] ], fn(obj, number, date, bool));
		DE([ 6, [ obj, [number, number, number], date, bool ] ], fn(obj, number, number, number, bool));
		DE([ 6, [ obj, undefined, date, bool ] ], fn(obj, bool));
	});

	it('bugs fixed on 20180302', function() {
		try {
			fn(foo, string, string);
		} catch(ex) {
			assert(ex instanceof overload2.UnmatchingException);
		}

		DE([ 7, [ foo, null, number ] ], fn(foo, number));
	});
});
