var MODULE_REQUIRE
	/* built-in */
	, assert = require('assert')

	/* NPM */

	/* in-package */
	, overload2 = require('../overload2')
	, Type = overload2.Type
	;


describe('Predefined datatypes', function() {
	it('?', function() {
		assert(Type.ANY.match(0));
		assert(Type.ANY.match(1));
		assert(Type.ANY.match(null));
		assert(Type.ANY.match(undefined));
		assert(Type.ANY.match(''));
		assert(Type.ANY.match(true));
		assert(Type.ANY.match(false));
		assert(Type.ANY.match([]));
		assert(Type.ANY.match({}));
	});

	it('ANY', function() {
		assert(Type.ANY.match(0));
		assert(Type.ANY.match(1));
		assert(Type.ANY.match(null));
		assert(Type.ANY.match(undefined));
		assert(Type.ANY.match(''));
		assert(Type.ANY.match(true));
		assert(Type.ANY.match(false));
		assert(Type.ANY.match([]));
		assert(Type.ANY.match({}));
	});

	it('BOOLEAN', function() {
		assert(Type.BOOLEAN.match(true));
		assert(Type.BOOLEAN.match(false));
		assert(!Type.BOOLEAN.match(1));
		assert(!Type.BOOLEAN.match(0));
	});

	it('CHAR', function() {
		assert(Type.CHAR.match('a'));
		assert(Type.CHAR.match('1'));
		assert(!Type.CHAR.match('ab'));
		assert(!Type.CHAR.match(1));
	});

	it('NUMBER', function() {
		assert(Type.NUMBER.match(1));
		assert(Type.NUMBER.match(0));
		assert(!Type.NUMBER.match('1'));
		assert(!Type.NUMBER.match(new Number(1)));
	});

	it('SCALAR', function() {
		assert(Type.SCALAR.match(99));
		assert(Type.SCALAR.match('foobar'));
		assert(Type.SCALAR.match(true));
		assert(Type.SCALAR.match(false));
		assert(!Type.SCALAR.match([]));
		assert(!Type.SCALAR.match({}));
	});

	it('STRING', function() {
		assert(Type.STRING.match('foobar'));
		assert(!Type.STRING.match(new String('foobar')));
	});
});

describe('Factory function', function() {
	it('enum', function() {
		var t = Type.enum(1,2,3);
		assert(t.match(1));
		assert(t.match(2));
		assert(t.match(3));
		assert(!t.match(0));
	});
});

describe('Logical transform on datatypes', function() {
	it('and', function() {
		var t1 = new Type(function(value) {
			return value.length == 2;
		});
		assert(Type.and(t1, Array).match([1,2]));
	});

	it('or', function() {
		var t = Type.or(Type.CHAR, Type.NUMBER);
		assert(t.match('a'));
		assert(t.match(99));
	});

	it('not', function() {
		var t = Type.not(Type.NUMBER);
		assert(t.match('foobar'));
		assert(!t.match(99));
	});
});
