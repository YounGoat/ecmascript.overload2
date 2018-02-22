/**
 * This example is to show how to indicate a param which may be absent 
 * (that means it is optional),
 * and how to set the default value.
 * @author youngoat@163.com
 */

const assert = require('assert');
const overload2 = require('overload2');

var d2000 = new Date('2000-10-01' /* Oct 1st, 2000 */ );
var d2050 = new Date('2050-10-01'); 
var getYear = overload2()
	.overload(
		// A param with absent (default) value is matter-of-course optional.
		[ Date, overload2.absent(d2000) ],

		// Set default value via literal expression.
		'number =1900',

		// Declare a param to be optional without setting default value.
		'string absent',

		function f_date(d, base, postfix) {
			// If absent, the default value will be `undefined`.
			if (postfix == undefined) postfix = 'Y';

			return base + d.getYear() + postfix;
		}
	)
	.default(
		function f_now() {
			return 1900 + (new Date).getYear();
		}
	)
	;

// f_date(d2000, 1900, undefined) invoked.
var year = getYear();
assert.equal('2000Y', year);

// f_date(d2050, 1900, undefined) invoked.
var year = getYear(d2050);
assert.equal('2050Y', year);

// f_date(d2050, 0, undefined) invoked.
var year = getYear(d2050, 0);
assert.equal('150Y', year);

// f_date(d2050, 1900, 'y') invoked.
var year = getYear(d2050, 'y');
assert.equal('2050y', year);

// f_date(d2000, 1900, 'y') invoked.
var year = getYear('y');
assert.equal('2000y', year);

console.log('THIS LINE REACHED MEANS EVERYTHING IS OK.');
