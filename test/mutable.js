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

describe('Mutable param *', function() {
	var fn = overload2()
		.overload('number', 'string', function(number, string) {
			return [ 1, Array.from(arguments) ];
		})
		.overload('number', '*', function(number, rest) {
			return [ 2, Array.from(arguments) ];
		})
		.overload('*', 'string', function(rest, number) {
			return [ 3, Array.from(arguments) ];
		})
		.overload('boolean', '*', 'number', function(bool, anythings, number) {
			return [ 4, Array.from(arguments) ];
		})
		.overload('boolean', '*', 'boolean', '*', function(bool, anythings, bool, rest) {
			return [ 5, Array.from(arguments) ];
		});

	it('ends with *', function() {
		DE([ 1, [ number, string ] ], fn(number, string));
		DE([ 2, [ number, [] ] ], fn(number));
		// DE([ 2, [ number, [number] ] ], fn(number, number));
		// DE([ 2, [ number, [string,number] ] ], fn(number, string, number));
	});

	it('starts with *', function() {
		DE([ 3, [ [], string ] ], fn(string));
		DE([ 3, [ [string], string ] ], fn(string, string));
		DE([ 3, [ [string,number], string ] ], fn(string, number, string));
	});

	it('embeded *', function() {
		DE([ 4, [ bool, [], number ] ], fn(bool, number));
		DE([ 4, [ bool, [number], number ] ], fn(bool, number, number));
		DE([ 4, [ bool, [string,number], number ] ], fn(bool, string, number, number));
	});

	it('double *', function() {
		DE([ 5, [ bool, [], bool, [] ] ], fn(bool, bool));
		DE([ 5, [ bool, [number], bool, [] ] ], fn(bool, number, bool));
		DE([ 5, [ bool, [number], bool, [date] ] ], fn(bool, number, bool, date));
	});
});

describe('Mutable param +', function() {
	var fn = overload2()
		.overload('number', 'string', function(number, string) {
			return [ 1, Array.from(arguments) ];
		})
		.overload('number', '+', function(number, rest) {
			return [ 2, Array.from(arguments) ];
		})
		.overload('number', function(number) {
			return [ 3, Array.from(arguments) ];
		})
		.overload('+', 'string', function(rest, string) {
			return [ 4, Array.from(arguments) ];
		})
		.overload('boolean', '+', 'number', function(bool, anythings, number) {
			return [ 5, Array.from(arguments) ];
		})
		.overload('boolean', '+', 'number', '+', function(bool, anythings, number, rest) {
			return [ 6, Array.from(arguments) ];
		})
		.overload('boolean', '+', 'boolean', '+', function(bool, anythings, bool, rest) {
			return [ 7, Array.from(arguments) ];
		})
		;

	it('ends with +', function() {
		DE([ 2, [ number, [number] ] ], fn(number, number));
		DE([ 3, [ number ] ], fn(number));
	});

	it('starts with +', function() {
		DE([ 4, [ [string], string ] ], fn(string, string));
		DE([ 4, [ [string,number], string ] ], fn(string, number, string));
	});

	it('embeded +', function() {
		DE([ 5, [ bool, [number], number ] ], fn(bool, number, number));
	});

	it('double +', function() {
		DE([ 6, [ bool, [number], number, [bool] ] ], fn(bool, number, number, bool));
		DE([ 7, [ bool, [bool], bool, [bool] ] ], fn(bool, bool, bool, bool));
	});
});

describe('Mutable param NUMBER', function() {
	var fn = overload2()
		.overload('number', 1, function() {
			return 2;
		})
		.overload('number', '2', function() {
			return 3;
		})
		.overload('string', '2,', function() {
			return 4;
		})
		.overload('boolean', ',3', function() {
			return 5;
		})
		.overload(Date, '2,3', function() {
			return 6;
		})
		;

	it('number N', function() {
		assert.equal(2, fn(1, 2));
	});

	it('string N', function() {
		assert.equal(3, fn(1, 2, 3))
	});

	it('string N,', function() {
		assert.equal(4, fn(string, 1, 2));
		assert.equal(4, fn(string, 1, 2, 3));
		assert.equal(4, fn(string, 1, 2, 3, 4));
		assert.equal(4, fn(string, 1, 2, 3, 4, 5));
	});

	it('string ,N', function() {
		assert.equal(5, fn(bool));
		assert.equal(5, fn(bool, 1));
		assert.equal(5, fn(bool, 1, 2));
		assert.equal(5, fn(bool, 1, 2, 3));
		try {
			fn(bool, 1, 2, 3, 4);
		} catch(ex) {
			assert(ex instanceof overload2.UnmatchingException);
		}
	});

	it('string M,N', function() {
		assert.equal(6, fn(date, 1, 2));
		assert.equal(6, fn(date, 1, 2, 3));
		try {
			fn(date, 1);
		} catch (ex) {
			assert(ex instanceof overload2.UnmatchingException);
		}
		try {
			fn(date, 1, 2, 3, 4);
		} catch (ex) {
			assert(ex instanceof overload2.UnmatchingException);
		}
	});
});

describe('Mutable param NUMBER (RegExp style)', function() {

	var fn = overload2()
		.overload('number', '{2}', function() {
			return 3;
		})
		.overload('string', '{2,}', function() {
			return 4;
		})
		.overload('boolean', '{,3}', function() {
			return 5;
		})
		.overload(Date, '{2,3}', function() {
			return 6;
		})
		;

	it('string {N}', function() {
		assert.equal(3, fn(1, 2, 3))
	});

	it('string {N,}', function() {
		assert.equal(4, fn(string, 1, 2));
		assert.equal(4, fn(string, 1, 2, 3));
		assert.equal(4, fn(string, 1, 2, 3, 4));
		assert.equal(4, fn(string, 1, 2, 3, 4, 5));
	});

	it('string {,N}', function() {
		assert.equal(5, fn(bool));
		assert.equal(5, fn(bool, 1));
		assert.equal(5, fn(bool, 1, 2));
		assert.equal(5, fn(bool, 1, 2, 3));
		try {
			fn(bool, 1, 2, 3, 4);
		} catch(ex) {
			assert(ex instanceof overload2.UnmatchingException);
		}
	});

	it('string {M,N}', function() {
		assert.equal(6, fn(date, 1, 2));
		assert.equal(6, fn(date, 1, 2, 3));
		try {
			fn(date, 1);
		} catch (ex) {
			assert(ex instanceof overload2.UnmatchingException);
		}
		try {
			fn(date, 1, 2, 3, 4);
		} catch (ex) {
			assert(ex instanceof overload2.UnmatchingException);
		}
	});
});

describe('Regurgitation', function() {
	it('regurgitation', function() {
		var fn = overload2()
			.overload('number +', 'number 2', function(a, b) {
				return a.length;
			})
			.overload('number +', function(a) {
				return a.length;
			})
			;
			
		assert.equal(1, fn(1));
		assert.equal(2, fn(1, 2));
		assert.equal(1, fn(1, 2, 3));
		assert.equal(2, fn(1, 2, 3, 4));
		assert.equal(3, fn(1, 2, 3, 4, 5));
	});
});
