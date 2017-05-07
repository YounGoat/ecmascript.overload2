var MODULE_REQUIRE
	/* built-in */
	, assert = require('assert')

	/* NPM */

	/* in-package */
	, overload2 = require('../overload2')
	;

describe('Throw Errors On Defining', () => {
	it('Type Arguments, missed', () => {
		try {
			new overload2.Type();
		} catch(ex) {
			assert(ex instanceof TypeError);
			assert(ex instanceof overload2.ArgumentsError);
		}
	});

	it('Type Arguments, redundant', () => {
		try {
			new overload2.Type(0, 1);
		} catch(ex) {
			assert(ex instanceof TypeError);
			assert(ex instanceof overload2.ArgumentsError);
		}
	});

	it('Type Arguments, wrong type', () => {
		try {
			new overload2.Type({});
		} catch(ex) {
			assert(ex instanceof TypeError);
			assert(ex instanceof overload2.TypeError);
		}
	});

	it('Param Arguments, missed', () => {
		try {
			new overload2.Param();
		} catch(ex) {
			assert(ex instanceof TypeError);
			assert(ex instanceof overload2.ArgumentsError);
		}
	});

	it('Param Arguments, wrong type', () => {
		try {
			new overload2.Param({});
		} catch(ex) {
			assert(ex instanceof TypeError);
			assert(ex instanceof overload2.TypeError);
		}
	});

	it('Param Arguments, invalid overload2.Type alias ', () => {
		try {
			new overload2.Param('nothing');
		} catch(ex) {
			assert(ex instanceof RangeError);
			assert(ex instanceof overload2.RangeError);
		}
	});

	it('Param Arguments, invalid param decorator', () => {
		try {
			new overload2.Param('number', 'null2');
		} catch(ex) {
			assert(ex instanceof RangeError);
			assert(ex instanceof overload2.RangeError);
		}
	});

	it('ParamList Arguments, wrong type', () => {
		try {
			new overload2.ParamList(1, 2, 3);
		} catch(ex) {
			assert(ex instanceof TypeError);
			assert(ex instanceof overload2.TypeError);
		}
	});

	it('Overload Arguments, missed', () => {
		try {
			new overload2.Overload();
		} catch(ex) {
			assert(ex instanceof TypeError);
			assert(ex instanceof overload2.ArgumentsError);
		}
	});

	it('Overload Arguments, implementation function missed', () => {
		try {
			new overload2.Overload({});
		} catch(ex) {
			assert(ex instanceof Error);
			assert(ex instanceof overload2.Error);
		}
	});

	it('Overload Arguments, redundant', () => {
		try {
			new overload2.Overload(2, 3, function() {});
		} catch(ex) {
			assert(ex instanceof TypeError);
			assert(ex instanceof overload2.ArgumentsError);
		}
	});
});


describe('Throw Exceptions On Invoking', () => {
	var fn1 = overload2();
	var fn2 = overload2().overload(function() {});

	it('EmptyException', () => {
		try {
			fn1();
		} catch(ex) {
			assert(ex instanceof Error);
			assert(ex instanceof overload2.EmptyException);
		}
	})

	it('UnmatchingException', () => {
		try {
			fn2('foo');
		} catch(ex) {
			assert(ex instanceof TypeError);
			assert(ex instanceof overload2.UnmatchingException);
		}
	});
})
